---
layout: single
categories: OS
tags: OS
---
# 클럭
cpu를 비롯한 특정한 장치들이 작동하는 신호

- 클럭 속도


# 스레드란?
>스레드는 어떠한 프로그램 내에서, 특히 프로세스 내에서 실행되는 흐름의 단위를 말한다

하나의 프로세스는 하나의 스레드를 가지고 있다.

---
# 스레드의 종류

## 하드웨어적 스레드

>*하나의 코어가 동시에 처리하는 명령어 단위*

하나의 코어에 여러 스레드(명령어 실행하는 부품)가 있는 CPU를  ***멀티스레드 프로세스,멀티스레드 CPU*** 라고 한다

>인텔의 멀티스레드 기술은 *하이퍼스레딩* 이라 한다.

## 소프트웨어적 스레드

>*하나의 프로그램에서 독립적으로 실행되는 단위*,
*프로세스를 구성하는 실행의 흐름 단위*

- 단일 스레드 프로세스
>*실행의 흐름 단위가 하나인 프로세스*

---
# 스레드의 구성
>- 스레드는 프로세스 내에서 각기 다른 스레드 ID,프로그램 카운터 값을 비롯한 레지스터 값,스택으로 구성된다.
>- 스레드는 실행에 필요한 최소한의 정보(프로그램 카운터를 포함한 레지스터,스택)만을 유지한채 프로세스 자원을 공유하며 실행된다.
즉,*Code,Data,Heap영역* 을 공유한다

- 스택을 독립적으로 할당하는 이유
>스택은 지역변수, 매개변수, 리턴 값 등을 저장하는 메모리 공간이다. 따라서 독립적인 함수 호출을 위해서는 독립적인 스택 메모리 공간이 필요하다. 스레드는 독립적인 실행 흐름이므로 독립된 스택을 할당해야 한다. 

- 프로그램 카운터(PC)를 독립적으로 할당하는 이유
>PC값은 스레드가 실행할 다음 명령어를 나타낸다. 스레드는 CPU를 할당받았다가 스케쥴러에 의해 다시 반환해야 할 수 있다. 따라서 처음부터 끝까지 연속적으로 수행되지 못하므로 어느 부분까지 수행했는지 기억할 필요가 있다. 이를 위해 PC 레지스터를 독립적으로 할당해야 한다. 

# 멀티 프로세스와 멀티스레드

## 멀티 프로세스란?
>여러 프로세스를 동시에 실행하는 것.

## 멀티 스레드란?
>여러 스레드로 프로세스를 동시에 실행하는 것.
 
 
 
# 프로세스간 통신(IPC)
프로세스는 기본적으로 자원을 공유하지 않지만,프로세스 간의 자원을 공유하고 데이터를 주고받는 것을 IPC라고 부른다.
만약 process A가 hello.txt 파일에 새로운 값을 쓰는 프로세스이고 process B는 hello.txt 파일을 읽는 프로세스라면 두 프로세스는 hello.txt를 통해 파일 속
데이터를 주고받음으로 파일을 통한 프로세스 간 통신으로 볼수 있다.   
또한 프로세스들은 서로 공유하는 메모리 영역을 두어 데이터를 주고받을 수 있다,이렇게 프로세스들이 공유할 수 있는 메모리 영역을 **shared memory** 라고 한다.  
만약 A,B가 공유하는 메모리 영역 내에 name 이라는 전역 변수가 있다고 가정했을때 process A 가 name 안에 값을 저장한뒤 process B 가 name 변수 값을 읽어들인다면 두 프로세스는 전역변수 name을 통해 서로 값을 주고받았다고 할수 있다.       
이 외에도 프로세스들은 소켓, 파이프 등을 통해 통신할수 있다.





#  reference
혼자공부하는 컴퓨터 구조 + 운영체제