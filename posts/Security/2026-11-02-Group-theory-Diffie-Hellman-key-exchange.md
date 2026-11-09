---
title: Group theory, Diffie-Hellman key exchange
tags:
  - 암호학
draft: false
---

# Group theory, Diffie-Hellman key exchange

> Group Theory, Diffie-Hellman Key Exchange, Discrete Logarithm Problem, Elliptic Curves

## 1. 개요

대칭키 암호(Symmetric-key Cryptography)에서는 송신자와 수신자가 동일한 비밀키를 사용한다.

AES와 같은 대칭키 암호는 효율적이지만, 통신하기 전에 **비밀키를 안전하게 공유해야 한다는 문제**가 발생한다.

\(N\)명의 사용자가 서로 독립적인 비밀키를 공유해야 한다면 필요한 키의 개수는

\[
\frac{N(N-1)}{2}=O(N^2)
\]

이다.

이를 해결하기 위해 KDC(Key Distribution Center)를 사용할 수도 있지만, 중앙 서버에 대한 의존성과 단일 장애점(Single Point of Failure)이 발생한다.

이러한 문제를 해결하기 위한 대표적인 공개키 기반 방식이 **Diffie-Hellman Key Exchange(DH)**이다.

Diffie-Hellman은 군론(Group Theory)의 수학적 성질과 이산로그 문제(Discrete Logarithm Problem)의 계산적 어려움을 이용한다.

---

## 2. Group Theory (군론)

### 2.1 Group (군)

**군(Group)**은 집합 \(G\)와 이항 연산 \(\star\)로 구성된 수학적 구조이다.

\[
(G,\star)
\]

군은 다음 세 조건을 만족해야 한다.

**1. 결합법칙 (Associativity)**

\[
(a\star b)\star c=a\star(b\star c)
\]

**2. 항등원 (Identity)**

모든 \(a\in G\)에 대해

\[
a\star e=e\star a=a
\]

를 만족하는 항등원 \(e\)가 존재해야 한다.

**3. 역원 (Inverse)**

모든 \(a\in G\)에 대해

\[
a\star a^{-1}=a^{-1}\star a=e
\]

를 만족하는 역원 \(a^{-1}\)이 존재해야 한다.

추가로

\[
a\star b=b\star a
\]

를 만족하면 **아벨 군(Abelian Group)**이라고 한다.

### 2.2 Group 예제

| 집합과 연산 | 군 여부 | 이유 |
|---|---|---|
| \((\mathbb Z,+)\) | O | 항등원 0, 덧셈 역원 존재 |
| \((\mathbb Z,\times)\) | X | 2의 곱셈 역원이 정수에 존재하지 않음 |
| \((\mathbb R^*,\times)\) | O | 0을 제외한 실수의 곱셈 역원 존재 |
| \((\mathbb Z_6,+)\) | O | mod 6 덧셈 역원 존재 |
| \((\mathbb Z_6,\times)\) | X | 2의 곱셈 역원 존재하지 않음 |

여기서 \(\mathbb R^*=\mathbb R\setminus\{0\}\)이다.

### 2.3 Modular Arithmetic

암호학에서는 모듈러 연산을 자주 사용한다.

예를 들어

\[
17\bmod5=2
\]

이다.

소수 \(p\)에 대해 다음 집합을 생각할 수 있다.

\[
\mathbb Z_p^*=\{1,2,\ldots,p-1\}
\]

이 집합은 **mod \(p\) 곱셈**에 대해 군을 이룬다.

예를 들어 \(\mathbb Z_{17}^*\)에서 3의 곱셈 역원은 6이다.

\[
3\times6=18\equiv1\pmod{17}
\]

따라서

\[
3^{-1}\equiv6\pmod{17}
\]

이다.

일반적으로 소수 \(p\)에 대해 0이 아닌 모든 원소는 곱셈 역원을 가진다.

이는 \(\gcd(a,p)=1\)이라는 사실과 **베주 항등식(Bézout's Identity)**으로 설명할 수 있다.

\[
ma+np=1
\]

양변에 mod \(p\)를 취하면

\[
ma\equiv1\pmod p
\]

이므로 \(m\)이 \(a\)의 곱셈 역원이다.

이러한 역원은 **확장 유클리드 알고리즘(Extended Euclidean Algorithm)**으로 계산할 수 있다.

### 2.4 Ring (환)과 Field (체)

기존에 학습했던 Ring과 Field도 함께 구분한다.

| 구조 | 특징 |
|---|---|
| Group | 하나의 연산에 대해 결합법칙, 항등원, 역원 성립 |
| Ring | 덧셈에 대해 아벨 군, 곱셈의 결합법칙과 분배법칙 성립 |
| Field | 교환환이며 0이 아닌 모든 원소의 곱셈 역원 존재 |

대표적인 유한체(Finite Field)는 소수 \(p\)에 대한

\[
\mathbb F_p=\mathbb Z_p
\]

이다.

여기서 두 군을 구분할 필요가 있다.

- \((\mathbb Z_p,+)\): 덧셈군
- \((\mathbb Z_p^*,\times)\): 곱셈군

특히 \(\mathbb Z_p^*\)는 Diffie-Hellman에서 사용하는 대표적인 군이다.

---

## 3. Finite Group과 Cyclic Group

### 3.1 Group Exponentiation

군에서 거듭제곱은 동일한 원소에 군 연산을 반복하는 것이다.

\[
g^n=\underbrace{g\star g\star\cdots\star g}_{n\text{번}}
\]

곱셈군에서는 일반적인 거듭제곱과 동일하게 표현한다.

\[
g^ng^m=g^{n+m}
\]

덧셈군에서는 \(g^n\) 대신 \(ng\)라는 표기를 주로 사용한다.

\[
ng=\underbrace{g+g+\cdots+g}_{n\text{번}}
\]

### 3.2 Finite Group (유한군)

원소의 개수가 유한한 군을 유한군이라고 한다.

군의 원소 개수는 **위수(Order)**라고 하며 \(|G|\)로 표현한다.

유한군에서는 모든 \(g\in G\)에 대해

\[
\boxed{g^{|G|}=e}
\]

가 성립한다.

여기서 \(e\)는 항등원이다.

예를 들어 \(\mathbb Z_7^*\)는 6개의 원소를 가진다.

\[
\mathbb Z_7^*=\{1,2,3,4,5,6\}
\]

따라서

\[
3^6\equiv1\pmod7
\]

이다.

이는 라그랑주 정리(Lagrange's Theorem)로부터 얻을 수 있는 성질이다.

### 3.3 Cyclic Group (순환군)

순환군(Cyclic Group)은 하나의 원소를 반복 연산하여 군 전체를 생성할 수 있는 군이다.

\[
G=\langle g\rangle
\]

여기서 \(g\)를 **생성원(Generator)**이라고 한다.

예를 들어 \(\mathbb Z_7^*\)에서 \(g=3\)을 사용하면

| \(k\) | \(3^k\bmod7\) |
|---|---|
| 0 | 1 |
| 1 | 3 |
| 2 | 2 |
| 3 | 6 |
| 4 | 4 |
| 5 | 5 |
| 6 | 1 |

이 된다.

3의 거듭제곱만으로 군의 모든 원소를 생성하므로 3은 \(\mathbb Z_7^*\)의 생성원이다.

반면 2의 거듭제곱은

\[
2^0,2^1,2^2,2^3\bmod7=1,2,4,1
\]

이므로 일부 원소만 생성한다.

따라서 2는 전체 군의 생성원이 아니다.

**Diffie-Hellman에서는 이러한 순환군의 성질을 활용한다.**

---

## 4. Diffie-Hellman Key Exchange

Diffie-Hellman은 두 사용자가 비밀키를 직접 전송하지 않고 동일한 공유 비밀값을 생성하는 키 교환 알고리즘이다.

### 4.1 키 교환 과정

Alice와 Bob은 다음 공개 정보를 공유한다.

- 소수 \(p\)
- 생성원 \(g\)

**Step 1. 개인 비밀값 생성**

Alice는 \(a\), Bob은 \(b\)를 무작위로 선택한다.

**Step 2. 공개키 계산**

Alice:

\[
A=g^a\bmod p
\]

Bob:

\[
B=g^b\bmod p
\]

**Step 3. 공개키 교환**

Alice와 Bob은 각각 자신의 공개키 \(A,B\)를 교환한다.

비밀값 \(a,b\)는 전송하지 않는다.

**Step 4. 공유 비밀값 계산**

Alice:

\[
Z=B^a\bmod p
\]

Bob:

\[
Z'=A^b\bmod p
\]

이때

\[
B^a=(g^b)^a=g^{ab}
\]

\[
A^b=(g^a)^b=g^{ab}
\]

이므로

\[
\boxed{Z=Z'=g^{ab}\bmod p}
\]

가 성립한다.

### 4.2 계산 예제

강의자료에서는 다음 값을 사용한다.

\[
p=1019,\quad g=2
\]

Alice의 비밀값:

\[
a=403
\]

Bob의 비밀값:

\[
b=901
\]

공개키는

\[
A=2^{403}\bmod1019=299
\]

\[
B=2^{901}\bmod1019=72
\]

이다.

공유 비밀값은 각각

\[
Z=72^{403}\bmod1019=526
\]

\[
Z'=299^{901}\bmod1019=526
\]

으로 계산된다.

따라서 두 사용자는 동일한 공유 비밀값 **526**을 얻는다.

이때 공격자는 \(p,g,A,B\)를 알고 있다.

그럼에도 비밀 지수 \(a,b\)나 공유 비밀값 \(g^{ab}\)를 쉽게 복구할 수 없어야 한다.

---

## 5. Discrete Logarithm Problem (DLOG)

### 5.1 이산로그 문제

일반적인 로그는 거듭제곱의 역연산이다.

\[
2^x=8\implies x=3
\]

이산로그 문제는 유한 순환군에서 다음 식을 만족하는 \(x\)를 찾는 문제이다.

\[
\boxed{g^x=X}
\]

모듈러 곱셈군에서는

\[
g^x\equiv X\pmod p
\]

로 표현한다.

예를 들어

\[
3^x\equiv6\pmod7
\]

이라면

\[
3^1\bmod7=3
\]

\[
3^2\bmod7=2
\]

\[
3^3\bmod7=6
\]

이므로

\[
x=3
\]

이다.

이처럼 작은 군에서는 쉽게 구할 수 있지만, 적절하게 선택된 큰 군에서는 효율적으로 계산하기 어렵다고 여겨진다.

### 5.2 DLOG Assumption

DLOG 가정은 공개된 \(g\)와 \(X=g^x\)로부터 비밀 지수 \(x\)를 계산하기 어렵다는 가정이다.

공격자가 알고 있는 정보:

\[
G,\quad g,\quad X=g^x
\]

공격 목표:

\[
x=\log_gX
\]

이다.

### 5.3 Computational Diffie-Hellman (CDH)

CDH는 다음 정보가 주어졌을 때

\[
g,\quad g^a,\quad g^b
\]

공유 비밀값

\[
\boxed{g^{ab}}
\]

를 계산하는 문제이다.

DLOG와 달리 비밀 지수 \(a,b\)를 직접 복구하지 않아도 된다.

공유 비밀값만 계산하면 CDH를 해결한 것이다.

### 5.4 Decisional Diffie-Hellman (DDH)

DDH는 다음 값이 주어졌을 때

\[
g,\quad g^a,\quad g^b,\quad T
\]

\(T\)가 실제 DH 공유 비밀값인지 판별하는 문제이다.

즉,

\[
T=g^{ab}
\]

인지, 아니면 독립적으로 선택한 무작위 군 원소인지 구분하는 것이다.

### 5.5 DLOG, CDH, DDH 관계

| 문제 | 목표 |
|---|---|
| DLOG | \(g^a\)에서 \(a\) 복구 |
| CDH | \(g^a,g^b\)에서 \(g^{ab}\) 계산 |
| DDH | \(T\)가 \(g^{ab}\)인지 판별 |

문제 사이에는 다음 환원 관계가 존재한다.

\[
\boxed{DDH\le_P CDH\le_P DLOG}
\]

이는 DLOG를 해결하는 알고리즘이 있다면 CDH도 해결할 수 있고, CDH를 해결할 수 있다면 DDH도 해결할 수 있다는 의미이다.

따라서 보안 가정의 강도는 일반적으로

\[
DDH\ Hard\Rightarrow CDH\ Hard\Rightarrow DLOG\ Hard
\]

의 관계를 갖는다.

반대 방향은 일반적으로 보장되지 않는다.

---

## 6. Algorithms for Solving DLOG

DLOG를 해결하는 알고리즘은 크게 두 종류로 구분할 수 있다.

**Generic Algorithm**

군의 구체적인 구조에 관계없이 적용 가능한 알고리즘이다.

- Brute-force
- Baby-step Giant-step
- Pollard's rho

**Group-specific Algorithm**

특정 군의 대수적 성질을 이용한다.

- Index-calculus
- Number Field Sieve 계열

### 6.1 Brute-force

가능한 모든 지수를 대입하는 방법이다.

\[
g^0,g^1,g^2,\ldots,g^{N-1}
\]

각 값을 \(X\)와 비교한다.

시간복잡도:

\[
O(N)
\]

공간복잡도:

\[
O(1)
\]

여기서 \(N=|G|\)이다.

### 6.2 Baby-step Giant-step (BSGS)

BSGS는 지수 \(x\)를 두 부분으로 나누어 탐색하는 알고리즘이다.

먼저

\[
n=\lceil\sqrt N\rceil
\]

으로 설정한다.

찾으려는 지수 \(x\)를

\[
x=nj-i
\]

로 표현한다.

원래 식이

\[
X=g^x
\]

이므로

\[
X=g^{nj-i}
\]

이다.

양변에 \(g^i\)를 곱하면

\[
\boxed{Xg^i=(g^n)^j}
\]

를 얻는다.

따라서 두 종류의 값을 계산하여 일치하는 값을 찾으면 된다.

**Baby-step**

\[
Xg^0,Xg^1,\ldots,Xg^{n-1}
\]

**Giant-step**

\[
g^0,g^n,g^{2n},\ldots,g^{n^2}
\]

일치하는 \(i,j\)를 찾았다면

\[
x=nj-i\pmod N
\]

으로 지수를 복구한다.

#### 계산 예제

다음 문제를 풀어보자.

\[
3^x\equiv11\pmod{17}
\]

\[
N=16,\quad n=4
\]

Baby-step:

| \(i\) | \(11\times3^i\bmod17\) |
|---|---|
| 0 | 11 |
| 1 | **16** |
| 2 | 14 |
| 3 | 8 |

Giant-step:

| \(j\) | \(3^{4j}\bmod17\) |
|---|---|
| 0 | 1 |
| 1 | 13 |
| 2 | **16** |
| 3 | 4 |

두 계산에서 16이 일치한다.

\[
i=1,\quad j=2
\]

따라서

\[
x=4\times2-1=7
\]

이다.

검산하면

\[
3^7\bmod17=11
\]

이므로 정답이다.

시간복잡도:

\[
O(\sqrt N)
\]

공간복잡도:

\[
O(\sqrt N)
\]

이다.

### 6.3 Pollard's rho

Pollard's rho는 의사난수적 수열에서 발생하는 **충돌(Collision)**을 이용하여 DLOG를 해결하는 알고리즘이다.

BSGS와 달리 대량의 값을 저장하지 않아도 된다.

Pollard's rho에서는 군 원소를

\[
X_i=g^{a_i}h^{b_i}
\]

형태로 표현할 수 있다.

여기서 \(h=g^x\)이다.

충돌이 발생해

\[
X_i=X_j
\]

가 되면

\[
g^{a_i}h^{b_i}=g^{a_j}h^{b_j}
\]

이므로

\[
a_i+b_ix\equiv a_j+b_jx\pmod q
\]

라는 관계식을 얻는다. 여기서 \(q\)는 사용하는 순환군의 위수이다.

따라서

\[
(b_i-b_j)x\equiv a_j-a_i\pmod q
\]

라는 합동식을 풀어 비밀 지수 \(x\)를 복구할 수 있다.

단, 계수가 역원을 갖지 않는 경우에는 별도의 처리가 필요하다.

### 6.4 알고리즘 비교

| 알고리즘 | 시간복잡도 | 공간복잡도 |
|---|---|---|
| Brute-force | \(O(N)\) | \(O(1)\) |
| BSGS | \(O(\sqrt N)\) | \(O(\sqrt N)\) |
| Pollard's rho | 기대 \(O(\sqrt N)\) | \(O(1)\) |

군의 크기가

\[
N=2^{256}
\]

이라면 Generic DLOG 공격의 복잡도는 약

\[
\sqrt{2^{256}}=2^{128}
\]

이 된다.

따라서 충분한 보안 강도를 확보하려면 군의 크기가 커야 한다.

다만 \(\mathbb Z_p^*\)에서는 Index-calculus나 Number Field Sieve처럼 대수적 구조를 이용하는 공격이 존재하므로 Generic Algorithm의 복잡도만으로 보안성을 판단할 수 없다.

---

## 7. Elliptic Curves (타원곡선)

### 7.1 타원곡선을 사용하는 이유

앞에서 살펴본 Diffie-Hellman은 \((\mathbb Z_p^*,\times)\)와 같은 곱셈군에서 구현할 수 있다.

하지만 이러한 군에서는 Index-calculus나 GNFS(General Number Field Sieve)처럼 특정 대수적 구조를 이용하는 공격 알고리즘이 존재한다.

따라서 충분한 보안 강도를 확보하려면 큰 파라미터가 필요하다.

이러한 문제에 대한 대표적인 대안이 **Elliptic Curve Cryptography(ECC)**이다.

적절하게 선택된 타원곡선군에서는 알려진 효율적인 공격이 제한적이므로 비교적 작은 키 크기로 높은 보안 강도를 제공할 수 있다.

### 7.2 타원곡선의 정의

타원곡선은 일반적으로 다음과 같은 방정식으로 표현할 수 있다.

\[
\boxed{y^2=x^3+ax+b}
\]

실수 위의 타원곡선에서는

\[
x,y,a,b\in\mathbb R
\]

이다.

곡선이 특이점을 갖지 않기 위해서는 다음 조건을 만족해야 한다.

\[
4a^3+27b^2\neq0
\]

대표적인 예시는

\[
y^2=x^3-2x+3
\]

이다.

타원곡선 암호에서 중요한 점은 곡선의 형태 자체가 아니라 **곡선 위의 점들이 특정한 덧셈 연산에 대해 군을 이룬다는 사실**이다.

### 7.3 Elliptic Curve Group

타원곡선 위의 두 점을

\[
P=(x_1,y_1)
\]

\[
Q=(x_2,y_2)
\]

라고 하자.

타원곡선에서는 다음과 같이 두 점을 더하는 연산을 정의할 수 있다.

\[
P+Q=R
\]

이때 점 덧셈은 단순한 좌표 덧셈이 아니다.

\[
P+Q\neq(x_1+x_2,y_1+y_2)
\]

대신 곡선의 기하학적 성질을 이용한다.

### 7.4 Point Addition (점 덧셈)

실수 위의 타원곡선에서 서로 다른 두 점 \(P,Q\)를 더하는 과정은 다음과 같다.

1. 두 점 \(P,Q\)를 지나는 직선을 그린다.
2. 해당 직선과 타원곡선이 만나는 세 번째 교점을 구한다.
3. 세 번째 교점을 \(x\)축에 대해 대칭 이동한다.
4. 대칭 이동한 점을 \(P+Q\)로 정의한다.

**점 덧셈 공식**

\[
P=(x_1,y_1),\quad Q=(x_2,y_2)
\]

이고 \(x_1\neq x_2\)일 때 직선의 기울기는

\[
\lambda=\frac{y_2-y_1}{x_2-x_1}
\]

이다.

새로운 점 \(R=P+Q=(x_3,y_3)\)는

\[
\boxed{x_3=\lambda^2-x_1-x_2}
\]

\[
\boxed{y_3=\lambda(x_1-x_3)-y_1}
\]

로 계산한다.

### 7.5 Point Doubling

만약 두 점이 동일하다면

\[
P=Q
\]

이므로 Point Doubling을 수행한다.

\[
P+P=2P
\]

두 점을 잇는 직선 대신 해당 점에서의 접선을 이용한다.

기울기는

\[
\boxed{\lambda=\frac{3x_1^2+a}{2y_1}}
\]

이며, 이후 \(x_3,y_3\)를 계산하는 공식은 점 덧셈과 동일하다.

### 7.6 Identity와 Inverse

타원곡선군에서는 특별한 원소인 **무한원점(Point at Infinity)**을 항등원으로 사용한다.

이를 \(\mathcal O\)로 표현한다.

\[
P+\mathcal O=P
\]

또한 점 \(P=(x,y)\)의 역원은

\[
-P=(x,-y)
\]

이다.

따라서

\[
P+(-P)=\mathcal O
\]

가 성립한다.

이러한 점 덧셈 연산을 통해 타원곡선 위의 점들과 무한원점은 **아벨 군(Abelian Group)**을 이룬다.

---

## 8. Elliptic Curves over Finite Fields

실제 타원곡선 암호에서는 실수 대신 유한체(Finite Field) 위에서 타원곡선을 정의한다.

소수 \(p\)에 대해

\[
\boxed{y^2\equiv x^3+ax+b\pmod p}
\]

로 표현할 수 있다.

여기서

\[
x,y,a,b\in\mathbb Z_p
\]

이다.

또한 \(4a^3+27b^2\not\equiv0\pmod p\)를 만족하는 비특이 곡선을 사용한다. 이 조건은 홀수 소수 \(p>3\)인 경우의 짧은 Weierstrass 형태에 해당한다.

실수 위의 타원곡선은 연속적인 곡선으로 나타나지만, 유한체 위에서는 가능한 좌표가 유한하므로 **이산적인 점들의 집합**으로 나타난다.

### 8.1 유한체 위의 점 덧셈

유한체에서도 점 덧셈 공식을 사용할 수 있다.

다만 모든 계산을 mod \(p\)로 수행한다.

서로 다른 두 점 \(P,Q\)에 대해 \(x_1\neq x_2\)이면

\[
\lambda=(y_2-y_1)(x_2-x_1)^{-1}\pmod p
\]

이다.

여기서 \((x_2-x_1)^{-1}\)은 모듈러 곱셈 역원이다.

이후

\[
x_3=(\lambda^2-x_1-x_2)\bmod p
\]

\[
y_3=(\lambda(x_1-x_3)-y_1)\bmod p
\]

로 계산한다.

### 8.2 계산 예제

강의자료에서는 다음 곡선을 사용한다.

\[
\boxed{y^2\equiv x^3+x-1\pmod7}
\]

이 곡선의 점들은 다음과 같다.

\[
\begin{aligned}
E(\mathbb F_7)=\{&
\mathcal O,\\
&(1,1),(1,6),\\
&(2,3),(2,4),\\
&(3,1),(3,6),\\
&(4,2),(4,5),\\
&(6,2),(6,5)\}
\end{aligned}
\]

무한원점을 포함하여 총 11개의 원소가 존재한다.

실제 점 덧셈을 계산해 보자.

\[
P=(2,3),\quad Q=(4,2)
\]

먼저 기울기를 계산한다.

\[
\lambda=\frac{2-3}{4-2}\pmod7
\]

\[
=\frac{-1}{2}\pmod7
\]

mod 7에서 2의 곱셈 역원은 4이다.

\[
2^{-1}\equiv4\pmod7
\]

따라서

\[
\lambda=(-1)\times4\bmod7=3
\]

이다.

이제 \(x_3\)를 계산한다.

\[
x_3=3^2-2-4=3\pmod7
\]

\(y_3\)는

\[
y_3=3(2-3)-3=-6\equiv1\pmod7
\]

이다.

따라서

\[
\boxed{(2,3)+(4,2)=(3,1)}
\]

이다.

---

## 9. Elliptic Curve Discrete Logarithm Problem (ECDLP)

일반적인 DLOG에서는 다음 문제를 다뤘다.

\[
g^x=X
\]

타원곡선에서는 거듭제곱 대신 점 덧셈을 반복하는 연산을 사용한다.

이를 **Scalar Multiplication(스칼라 곱)**이라고 한다.

\[
nP=\underbrace{P+P+\cdots+P}_{n\text{번}}
\]

예를 들어

\[
3P=P+P+P
\]

이다.

ECDLP는 다음과 같이 정의한다.

주어진 값:

\[
P,\quad Q=nP
\]

찾아야 하는 값:

\[
\boxed{n}
\]

즉, 점 \(P\)와 \(nP\)를 알고 있을 때 비밀 정수 \(n\)을 복구하는 문제이다.

### 9.1 DLOG와 ECDLP 비교

| 구분 | DLOG | ECDLP |
|---|---|---|
| 기반 군 | 유한체 곱셈군 | 타원곡선군 |
| 연산 | 곱셈 | 점 덧셈 |
| 공개 정보 | \(g,g^x\) | \(P,nP\) |
| 비밀값 | 지수 \(x\) | 스칼라 \(n\) |
| 공격 목표 | \(x\) 복구 | \(n\) 복구 |

타원곡선에서도 BSGS와 Pollard's rho 같은 Generic DLOG 알고리즘을 적용할 수 있다.

하지만 안전하게 선택된 일반적인 타원곡선에서는 유한체 곱셈군에 적용되는 Index-calculus나 GNFS 같은 공격을 동일하게 효율적으로 적용하기 어렵다.

따라서 상대적으로 작은 파라미터 크기로 높은 보안 강도를 확보할 수 있다.

---

## 10. Elliptic Curve Diffie-Hellman (ECDH)

타원곡선에서도 Diffie-Hellman 키 교환을 구현할 수 있다.

기존 DH에서는

\[
A=g^a,\quad B=g^b
\]

를 사용했다.

반면 ECDH에서는 생성점 \(P\)에 대한 스칼라 곱으로 공개키를 계산한다.

### 10.1 ECDH 키 교환 과정

공개 정보:

- 타원곡선 \(E(\mathbb F_p)\)
- 생성점 \(P\)
- 생성점의 위수 \(q\)

**Step 1. 비밀값 선택**

Alice와 Bob은 각각 비밀값 \(a,b\)를 선택한다.

\[
a,b\in\{1,\ldots,q-1\}
\]

**Step 2. 공개키 계산**

Alice:

\[
A=aP
\]

Bob:

\[
B=bP
\]

**Step 3. 공개키 교환**

Alice와 Bob은 공개키 \(A,B\)를 교환한다.

**Step 4. 공유 비밀값 계산**

Alice:

\[
Z=aB
\]

Bob:

\[
Z'=bA
\]

이를 전개하면

\[
aB=a(bP)=abP
\]

\[
bA=b(aP)=abP
\]

이므로

\[
\boxed{Z=Z'=abP}
\]

가 성립한다.

두 사용자는 서로의 비밀값을 알지 못하더라도 동일한 타원곡선 위의 점을 계산한다.

실제 구현에서는 이러한 공유점으로부터 KDF를 사용하여 대칭키를 생성한다.

### 10.2 DH와 ECDH 비교

| 구분 | DH | ECDH |
|---|---|---|
| 기반 군 | 유한체 곱셈군 | 타원곡선군 |
| 주요 연산 | 모듈러 거듭제곱 | 점의 스칼라 곱 |
| 공개키 | \(g^a\) | \(aP\) |
| 공유 비밀값 | \(g^{ab}\) | \(abP\) |
| 기반 문제 | DLOG, CDH | ECDLP, ECCDH |
| 특징 | 큰 모듈러스 필요 | 작은 파라미터로 높은 보안 강도 가능 |

---

## 11. Finite-field DH vs. Elliptic-curve DH

강의자료 44~46페이지에서는 **유한체 기반 DH와 타원곡선 기반 DH의 파라미터 크기**를 비교한다.

### 11.1 Finite-field DH의 한계

\[
(\mathbb Z_p^*,\times)
\]

에서는 대수적 구조를 이용하는 특수 공격 알고리즘이 존재한다.

대표적으로 GNFS(General Number Field Sieve)가 있다.

따라서 충분한 보안 강도를 확보하려면 큰 모듈러 소수 \(p\)가 필요하다.

강의자료 45페이지에서는 매우 큰 소수 \(p\)를 이용하여 DH를 수행하는 예제를 보여준다.

공개키는

\[
A=g^a\bmod p
\]

\[
B=g^b\bmod p
\]

이고 공유 비밀값은

\[
Z=g^{ab}\bmod p
\]

이다.

모듈러스가 커질수록 연산에 사용하는 정수의 크기도 커진다.

따라서 더 많은 계산 자원이 필요하다.

### 11.2 Elliptic-curve DH의 장점

타원곡선에서는 일반적인 유한체 곱셈군의 특수 DLOG 공격과 같은 효율적인 공격이 알려져 있지 않은 적절한 곡선을 사용할 수 있다.

강의자료 46페이지에서는 약 256비트 크기의 유한체 위에서 ECDH를 수행하는 예제를 제시한다.

공개키는

\[
A=aP
\]

\[
B=bP
\]

이고 공유 비밀값은

\[
Z=abP
\]

이다.

유한체 DH에 비해 더 작은 파라미터로 높은 보안 강도를 확보할 수 있다.

### 11.3 보안 강도 비교

고전적 공격에 대해 약 128비트 보안 강도를 목표로 하는 경우 대표적인 파라미터는 다음과 같다.

| 구분 | 대표적인 파라미터 크기 | 보안 강도 |
|---|---|---|
| Finite-field DH | 약 3072비트 모듈러스 | 약 128비트 |
| Elliptic-curve DH | 약 256비트 군 위수 | 약 128비트 |

단, 256비트 타원곡선 좌표체를 사용한다는 사실만으로 128비트 보안 강도가 자동 보장되지는 않는다. 곡선의 선택, 점의 위수, 구현 방식 등을 함께 고려해야 한다.

핵심은 **같은 보안 강도를 얻기 위해 ECDH가 일반적으로 더 작은 키와 파라미터를 사용할 수 있다**는 것이다.

---

## 12. Diffie-Hellman Security

마지막 슬라이드에서는 Diffie-Hellman의 보안성을 군의 종류에 따라 정리한다.

Diffie-Hellman에서 공격자가 알고 있는 값은 다음과 같다.

\[
G,\quad g,\quad A=g^a,\quad B=g^b
\]

공격자는 다음 두 문제를 해결하려고 한다.

**1. DLOG Problem**

\[
g^a\rightarrow a
\]

공개키에서 비밀 지수를 복구하는 문제이다.

**2. DH Problem (CDH)**

\[
g^a,g^b\rightarrow g^{ab}
\]

두 공개키에서 공유 비밀값을 계산하는 문제이다.

### 12.1 군에 따른 보안성

| 군 | 보안성 | 이유 |
|---|---|---|
| \((\mathbb Z_p,+)\) | 안전하지 않음 | 비밀값을 쉽게 복구 가능 |
| \((\mathbb Z_p^*,\times)\) | 적절한 큰 파라미터에서 안전하다고 가정 | DLOG, CDH 계산의 어려움 |
| \((E(\mathbb F_p),+)\) | 적절한 큰 위수의 안전한 부분군에서 안전하다고 가정 | ECDLP, ECCDH 계산의 어려움 |

### 12.2 덧셈군이 안전하지 않은 이유

\((\mathbb Z_p,+)\)에서 생성원 \(g\)를 사용한다고 하자.

공개키는

\[
A=ag\pmod p
\]

이다.

여기서 \(g\neq0\)이면 \(g\)의 곱셈 역원을 계산할 수 있다.

따라서

\[
a=Ag^{-1}\pmod p
\]

로 비밀값 \(a\)를 쉽게 구할 수 있다.

즉, 덧셈군에서는 비밀 지수를 복구하는 문제가 어렵지 않다.

반면 유한체 곱셈군과 적절한 타원곡선군에서는 이러한 역연산을 효율적으로 수행하기 어렵다고 여겨진다.

### 12.3 보안 가정과 실제 프로토콜의 차이

DLOG 또는 CDH가 어렵다고 해서 기본 DH 프로토콜의 모든 보안 문제가 해결되는 것은 아니다.

기본적인 Diffie-Hellman은 상대방을 인증하지 않으므로 **중간자 공격(Man-in-the-Middle Attack)**이 가능하다.

실제 프로토콜에서는 인증서, 디지털 서명 또는 다른 인증 절차를 함께 사용해야 한다.

또한 공개키의 유효성 검증과 안전한 파라미터 선택도 중요하다.

---

## 13. 전체 정리

이번 강의에서는 군론의 기초부터 Diffie-Hellman, 이산로그 문제, 그리고 타원곡선 기반 암호까지 학습했다.

**Group Theory**에서는 군의 세 가지 공리와 순환군, 생성원의 개념을 이해했다.

**Diffie-Hellman**에서는 공개키를 교환하여 동일한 공유 비밀값을 생성하는 원리를 확인했다.

**DLOG, CDH, DDH**에서는 공격자가 해결해야 하는 계산 문제와 그 관계를 학습했다.

**BSGS와 Pollard's rho**에서는 이산로그를 해결하는 알고리즘이 존재하며, Generic DLOG 공격의 계산 복잡도가 대략 \(O(\sqrt N)\)이라는 사실을 확인했다.

**Elliptic Curves**에서는 곡선 위의 점들이 덧셈 연산에 대해 군을 이루며, 이를 이용해 ECDLP와 ECDH를 정의할 수 있다는 것을 알게 되었다.

마지막으로 유한체 DH와 ECDH를 비교하면서 **동일한 보안 강도를 확보하기 위해 사용하는 군의 종류와 파라미터 크기가 중요하다**는 점을 확인했다.

| 주제 | 핵심 내용 |
|---|---|
| Group | 결합법칙, 항등원, 역원 |
| Cyclic Group | 생성원으로 전체 군 생성 |
| Finite Group | \(g^{\lvert G\rvert}=e\) |
| Diffie-Hellman | \(g^{ab}\) 공유 |
| DLOG | \(g^x\)에서 \(x\) 복구 |
| CDH | \(g^a,g^b\)에서 \(g^{ab}\) 계산 |
| DDH | DH 공유값인지 판별 |
| BSGS | \(O(\sqrt N)\) 시간·공간 |
| Pollard's rho | 기대 \(O(\sqrt N)\) 시간, \(O(1)\) 공간 |
| Elliptic Curve | 점 덧셈으로 군 구성 |
| ECDLP | \(P,nP\)에서 \(n\) 복구 |
| ECDH | \(abP\) 공유 |
| DH Security | 군의 구조와 계산 문제의 어려움에 의존 |

결과적으로 공개키 암호에서 중요한 것은 단순히 큰 수를 사용하는 것이 아니라 **효율적인 정방향 연산과 어려운 역방향 계산 문제를 동시에 만족하는 수학적 구조를 선택하는 것**이다.

## 참고 자료

- Jiseung Kim, *8. Group theory, Diffie-Hellman key exchange*, 암호학 강의자료, pp. 1–47.
- Diffie, W. & Hellman, M. (1976). *New Directions in Cryptography*.
- 추가 설명: Ring/Field 구분, DDH, 타원곡선 점 덧셈의 표준 계산식, ECDH 구현 시 인증과 공개키 검증의 필요성.
