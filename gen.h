#include <bits/stdc++.h>
#include <bits/extc++.h>
typedef long long int64;
typedef unsigned int uint;
typedef unsigned long long uint64;
typedef __int128 int128;
typedef __uint128_t uint128;
typedef double db;
typedef long double ldb;
typedef std::pair<int, int> pii;
typedef std::pair<int64, int64> pii64;

enum Shuffle {
	shuffled,
	unshuffled,
};

struct Config {
	Shuffle edge, node, direct;
};


namespace Random {
	std::mt19937 rng(std::chrono::steady_clock::now().time_since_epoch().count());
	template <typename Tp>
	inline Tp rand(Tp l, Tp r);
	template <>
	inline int rand(int l, int r) {
		return std::uniform_int_distribution<int>(l, r)(rng);
	}
	template <>
	inline int64 rand(int64 l, int64 r) {
		return std::uniform_int_distribution<int64>(l, r)(rng);
	}
	template <>
	inline uint rand(uint l, uint r) {
		return std::uniform_int_distribution<uint>(l, r)(rng);
	}
	template <>
	inline uint64 rand(uint64 l, uint64 r) {
		return std::uniform_int_distribution<uint64>(l, r)(rng);
	}
	template <>
	inline db rand(db l, db r) {
		return std::uniform_real_distribution<db>(l, r)(rng);
	}
	template <>
	inline ldb rand(ldb l, ldb r) {
		return std::uniform_real_distribution<ldb>(l, r)(rng);
	}
	template <typename Tp>
	inline Tp rand(Tp n) {
		return rand((Tp)0, n);
	}
	inline double rand() {
		return rand(0.0, 1.0);
	}
	template <typename Tp>
	inline Tp randK(Tp n, int k) {
		if (std::abs(k) < 25) {
			Tp ans = rand(n);
			for (int i = 1; i <= +k; i++) {
				ans = std::max(ans, rand(n));
			}
			for (int i = 1; i <= -k; i++) {
				ans = std::min(ans, rand(n));
			}
			return ans;
		}
		double p = pow(rand(), 1.0 / (std::abs(k) + 1));
		return (Tp)((k > 0 ? p : 1.0 - p) * n);
	}
	template <typename Tp>
	inline Tp randK(Tp l, Tp r, int k) {
		return l + randK(r - l, k);
	}
	inline int rand01() {
		return rand(0, 1);
	}
	template <typename Tp>
	inline typename Tp::iterator iterator(const Tp &c) {
		return c.begin() + rand((int)c.size() - 1);
	}
	template <typename Tp>
	inline Tp iterator(const Tp &begin, const Tp &end) {
		return begin + rand((int)(end - begin) - 1);
	}
	template <typename Tp>
	inline std::pair<Tp, Tp> interval(Tp l, Tp r) {
		Tp x = rand(l, r), y = rand(l, r);
		return x <= y ? std::make_pair(x, y) : std::make_pair(y, x);
	}
	inline std::vector<int> permutation(int n) {
		std::vector<int> p(n);
		std::iota(p.begin(), p.end(), 1);
		std::shuffle(p.begin(), p.end(), rng);
		return p;
	}
	template <typename Tp>
	inline std::vector<Tp> sequence(int n, Tp l, Tp r) {
		std::vector<Tp> a(n);
		for (auto &x : a) {
			x = rand(l, r);
		}
		return a;
	}
}







struct Edge {
	int u, v;
	inline Edge() {}
	inline Edge(int u, int v) : u(u), v(v) {}
	inline void swap() {
		std::swap(u, v);
	}
};

struct EdgeW {
	int u, v, w;
	inline EdgeW() {}
	inline EdgeW(int u, int v, int w) : u(u), v(v), w(w) {}
	inline EdgeW(const Edge &e, int w) : u(e.u), v(e.v), w(w) {}
	inline void swap() {
		std::swap(u, v);
	}
};

struct Tree {
	int n, root;
	std::vector<Edge> edge;
	inline Tree(int n, const std::vector<Edge> &edge = {}) : n(n), root(1), edge(edge) {}
	inline Tree(int n, int root, const std::vector<Edge> &edge = {}) : n(n), root(root), edge(edge) {}
	inline int size() const {
		return n;
	}
	inline void addEdge(int u, int v) {
		edge.push_back(Edge(u, v));
	}
	inline void addEdge(const Edge &e) {
		edge.push_back(e);
	}
	inline void shuffleDirect() {
		for (auto &e : edge) {
			if (Random::rand01()) {
				e.swap();
			}
		}
	}
	inline void shuffleEdge() {
		std::shuffle(edge.begin(), edge.end(), Random::rng);
	}
	inline void shuffleNode(int newRoot) {
		std::vector<int> p = Random::permutation(n);
		for (auto &x : p) {
			if (x == newRoot) {
				std::swap(x, p[root - 1]);
			}
		}
		for (auto &e : edge) {
			e.u = p[e.u - 1];
			e.v = p[e.v - 1];
		}
	}
	inline void shuffleNode() {
		shuffleNode(Random::rand(1, n));
	}
	inline void shift(int d) {
		root += d;
		for (auto &e : edge) {
			e.u += d;
			e.v += d;
		}
	}
	inline void apply(Config config) {
		if (config.edge == shuffled) {
			shuffleEdge();
		}
		if (config.node == shuffled) {
			shuffleNode(root);
		}
		if (config.direct == shuffled) {
			shuffleDirect();
		}
	}
	inline void print() {
		for (auto e : edge) {
			printf("%d %d\n", e.u, e.v);
		}
	}
};

struct Graph {
	int n;
	std::vector<Edge> edge;
	inline Graph(int n, const std::vector<Edge> &edge = {}) : n(n), edge(edge) {}
};






namespace TreeGenerator {
	inline Tree chain(int n, int root, const Config &config = {shuffled, shuffled, shuffled}) {
		Tree T(n, root);
		for (int u = root, v = root % n + 1, i = 1; i < n; i++) {
			T.addEdge(u, v);
			u = u % n + 1;
			v = v % n + 1;
		}
		T.apply(config);
		return T;
	}
	inline Tree flower(int n, int root, const Config &config = {shuffled, shuffled, shuffled}) {
		Tree T(n, root);
		for (int i = 1; i <= n; i++) {
			if (i != root) {
				T.addEdge(root, i);
			}
		}
		T.apply(config);
		return T;
	}
	inline Tree prufer(int n, int root, const std::vector<int> &pf, const Config &config = {shuffled, shuffled, shuffled}) {
		std::vector<int> deg(n + 1, 1);
		for (auto u : pf) {
			deg[u]++;
		}
		int p = 1;
		for (; deg[p] != 1; p++);
		int leaf = p;
		Tree T(n, root);
		for (auto u : pf) {
			T.addEdge(leaf, u);
			if (--deg[u] == 1 && u < p) {
				leaf = u;
			} else {
				p++;
				for (; deg[p] != 1; p++);
				leaf = p;
			}
		}
		T.addEdge(leaf, n);
		T.apply(config);
		return T;
	}
	inline Tree prufer(int n, int root, const Config &config = {shuffled, shuffled, shuffled}) {
		return prufer(n, root, Random::sequence(n - 2, 1, n), config);
	}
	inline Tree backward(int n) {
		Tree T(n, 1);
		for (int i = 2; i <= n; i++) {
			T.addEdge(Random::rand(1, i - 1), i);
		}
		return T;
	}
	inline Tree backward(int n, double low, double high) {
		Tree T(n, 1);
		for (int i = 2; i <= n; i++) {
			T.addEdge(Random::rand(ceil((i - 2) * low) + 1, ceil((i - 2) * high) + 1), i);
		}
		return T;
	}
	inline Tree backward(int n, int k) {
		Tree T(n, 1);
		for (int i = 2; i <= n; i++) {
			T.addEdge(Random::rand(std::max(i - k, 1), i - 1), i);
		}
		return T;
	}
	inline Tree binaryComplete(int n) {
		Tree T(n, 1);
		for (int i = 2; i <= n; i++) {
			T.addEdge(i / 2, i);
		}
		return T;
	}
	inline Tree binaryFull(int h) {
		return binaryComplete((1 << h) - 1);
	}
}

namespace GraphGenerator {
	
}

namespace NumberGenerator {
	inline uint64 genPrime(uint64 n) {

	}
	inline uint64 genComposition(uint64 n) {
		
	}
	inline int maximumNumberDivisors(int n) {
		static const std::vector<int> num = {0, 1, 2, 4, 6, 12, 24, 36, 48, 60, 120, 180, 240, 360, 720, 840, 1260, 1680, 2520, 5040, 7560, 10080, 15120, 20160, 25200, 27720, 45360, 50400, 55440, 83160, 110880, 166320, 221760, 277200, 332640, 498960, 554400, 665280, 720720, 1081080, 1441440, 2162160, 2882880, 3603600, 4324320, 6486480, 7207200, 8648640, 10810800, 14414400, 17297280};
		return *std::lower_bound(num.begin(), num.end(), n);
	}
	inline uint64 maximumNumberPrimes(uint64 n) {
		static const std::vector<uint64> num = {1, 2, 6, 30, 210, 2310, 30030, 510510, 9699690, 223092870, 6469693230ULL, 200560490130ULL, 7420738134810ULL, 304250263527210ULL, 13082761331670030ULL, 614889782588491410ULL};
		return *std::lower_bound(num.begin(), num.end(), n);
	}
}







// template <typename Tp>
// inline std::vector<Tp> sequenceLimit(const int &n, const std::vector<int> &lim, const Tp &l, const Tp &r) {
// 	assert(n >= 1 && lim.size() == r - l + 1 && std::accumulate(lim.begin(), lim.end(), 0LL) >= n);
// 	__gnu_pbds::tree<std::vector<Tp, int>, __gnu_pbds::null_type, std::less<std::pair<Tp, int>>, __gnu_pbds::rb_tree_tag, __gnu_pbds::tree_order_statistics_node_update> cnt;
// 	for (Tp i = l; i <= r; i++) {
// 		assert(lim[i - l] >= 0);
// 		cnt.insert(std::make_pair(i, lim[i - l]));
// 	}
// 	std::vector<Tp> seq(n);
// 	for (auto &x : seq) {
// 		auto now = cnt.find_by_order(get((int)cnt.size() - 1));
// 		x = now->first;
// 		int t = now->second - 1;
// 		cnt.erase(now);
// 		if (t > 0) {
// 			cnt.insert(std::make_pair(x, t));
// 		}
// 	}
// 	std::shuffle(seq.begin(), seq.end(), rng);
// 	return seq;
// }
// template <typename Tp>
// inline std::vector<Tp> sequenceLimit(const int &n, const int &k, const Tp &l, const Tp &r) {
// 	assert(n >= 1 && k >= 1 && r - l + 1 <= VECTOR_MAX_SIZE);
// 	return sequenceLimit(n, VI(r - l + 1, k), l, r);
// }


























// namespace TreeGenerator {
// 	inline int pow(int x, int k) {
// 		assert(x >= 0 && k >= 0);
// 		int ans = 1;
// 		for (int i = 1; i <= k; i++) {
// 			ans *= x;
// 		}
// 		return ans;
// 	}
// 	inline Tree genCompMultipleOrdered(const int &n, const int &k) {
// 		assert(n >= 3 && k >= 2);
// 		Tree T(1);
// 		for (int i = 2; i <= n; i++) {
// 			T.addEdge((i - 2) / k + 1, i);
// 		}
// 		return T;
// 	}
// 	inline Tree genCompBinaryOrdered(const int &n) {
// 		assert(n >= 3);
// 		return genCompMultipleOrdered(n, 2);
// 	}
// 	inline Tree genFullMultipleOrdered(const int &dep, const int &k) {
// 		assert(dep >= 2 && k >= 2);
// 		return genCompMultipleOrdered((pow(k, dep) - 1) / (k - 1), k);
// 	}
// 	inline Tree genFullBinaryOrdered(const int &dep) {
// 		assert(dep >= 2);
// 		return genCompMultipleOrdered((1 << dep) - 1, 2);
// 	}
// 	inline Tree genCompMultiple(const int &n, const int &root, const int &k) {
// 		assert(n >= 3 && 1 <= root && root <= n && k >= 2);
// 		Tree T = genCompMultipleOrdered(n, k);
// 		T.shuffle(root);
// 		return T;
// 	}
// 	inline Tree genCompBinary(const int &n, const int &root) {
// 		assert(n >= 3 && 1 <= root && root <= n);
// 		return genCompMultiple(n, root, 2);
// 	}
// 	inline Tree genFullMultiple(const int &dep, const int &root, const int &k) {
// 		assert(dep >= 2 && k >= 2 && 1 <= root && root <= (pow(k, dep) - 1) / (k - 1));
// 		return genCompMultiple((pow(k, dep) - 1) / (k - 1), root, k);
// 	}
// 	inline Tree genFullBinary(const int &dep, const int &root) {
// 		assert(dep >= 2 && 1 <= root && root <= (1 << dep) - 1);
// 		return genCompMultiple((1 << dep) - 1, root, 2);
// 	}
// 	inline Tree genMultiple(const int &n, const int &root, const int &k) {
// 		assert(n >= 3 && 1 <= root && root <= n && k >= 1);
// 		std::vector<int> lim(n, k);
// 		lim[root - 1]--;
// 		return tranPrufer(n, root, sequenceLimit(n - 2, lim, 1, n));
// 	}
// 	inline Tree genBinary(const int &n, const int &root) {
// 		assert(n >= 3 && 1 <= root && root <= n);
// 		return genMultiple(n, root, 2);
// 	}
// 	inline void linkRoot(Tree S, Tree &T, const int &nodeT) {
// 		assert(1 <= nodeT && nodeT <= T.size());
// 		S.addIndex(T.size());
// 		for (const auto &e : S.E) {
// 			T.addEdge(e);
// 		}
// 		T.addEdge(nodeT, S.root);
// 	}
// }








// namespace NumberGenerator {
// }