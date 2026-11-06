---
title: '[QEMU] Apple Silicon Mac에서 Red Hat Linux 6.2 설치 및 실행하기'
draft: false
---

## 1. 개요

시스템 보안 수업에서 스택 버퍼 오버플로우 실습을 진행하기 위해 오래된 Linux 환경이 필요했다.

처음에는 Ubuntu 16.04를 Docker에서 실행했지만, 컴파일러의 스택 배치 방식과 ASLR 등의 차이로 강의자료와 동일한 결과를 재현하기 어려웠다.

따라서 강의자료에서 사용한 **Red Hat Linux 6.2**를 QEMU로 실행하기로 했다.

Red Hat 6.2는 2000년에 출시된 운영체제로, Linux 2.2 계열 커널을 사용한다.

### 실습 환경

| 항목 | 설정 |
| --- | --- |
| 호스트 | Apple Silicon Mac |
| 에뮬레이터 | QEMU 11.1.3 |
| 게스트 OS | Red Hat Linux 6.2 (Zoot) |
| 아키텍처 | i386 (32비트 x86) |
| CPU | Pentium III |
| RAM | 256MB |
| 디스크 | 4GB qcow2 |
| 디스크 인터페이스 | IDE |
| 그래픽 | Cirrus VGA |
| 부팅 방식 | Legacy BIOS / LILO |
| 가속 방식 | TCG |

Apple Silicon은 ARM64 아키텍처이므로 x86 운영체제를 직접 하드웨어 가상화할 수 없다.

따라서 QEMU의 **TCG(Tiny Code Generator)** 를 이용해 x86 CPU를 소프트웨어 방식으로 에뮬레이션했다.




## 2. QEMU 설치

macOS에서는 Homebrew로 QEMU를 설치할 수 있다.

```plain
brew install qemu
```

설치 후 버전 확인:

```plain
qemu-system-i386 --version
```

실제 사용한 버전은 다음과 같았다.

```plain
QEMU emulator version 11.1.3
Copyright (c) 2003-2026 Fabrice Bellard and the QEMU Project developers
```

`qemu-system-i386`은 32비트 x86 시스템을 에뮬레이션하는 실행 파일이다.




## 3. Red Hat Linux 6.2 설치 준비

필요한 파일은 다음과 같다.

- `redhat62.iso`: Red Hat 6.2 설치 이미지
- `redhat62.qcow2`: 가상 하드디스크

ISO 파일은 다음 경로에 배치했다.

```plain
~/Downloads/redhat62.iso
```

### 가상 디스크 생성

```plain
qemu-img create -f qcow2 ~/Downloads/redhat62.qcow2 4G
```

이 명령어로 4GB 크기의 qcow2 가상 디스크를 생성한다.

`qcow2`는 QEMU에서 사용하는 가상 디스크 형식으로, 스냅샷과 동적 공간 할당 등을 지원한다.

**주의:** 이미 설치된 디스크가 있다면 같은 파일에 생성 명령어를 다시 실행하지 않아야 한다.




## 4. QEMU로 Red Hat 6.2 설치

다음 명령어로 가상머신을 실행했다.

```plain
qemu-system-i386 \
  -machine pc \
  -accel tcg \
  -cpu pentium3 \
  -m 256 \
  -drive file="$HOME/Downloads/redhat62.qcow2",format=qcow2,if=ide \
  -cdrom "$HOME/Downloads/redhat62.iso" \
  -boot d \
  -vga cirrus \
  -display cocoa,zoom-to-fit=on
```

### 주요 옵션

| 옵션 | 역할 |
| --- | --- |
| `-machine pc` | 기존 PC 하드웨어 에뮬레이션 |
| `-accel tcg` | 소프트웨어 CPU 에뮬레이션 |
| `-cpu pentium3` | Pentium III CPU 에뮬레이션 |
| `-m 256` | RAM 256MB |
| `-drive` | qcow2 가상 디스크 연결 |
| `if=ide` | IDE 인터페이스 사용 |
| `-cdrom` | 설치 ISO 연결 |
| `-boot d` | CD-ROM 우선 부팅 |
| `-vga cirrus` | 구형 Cirrus 그래픽 장치 |
| `zoom-to-fit=on` | macOS 창 크기에 맞춰 화면 확대 |

처음에는 ISO 파일을 qcow2 디스크로 지정하는 실수를 했다.

```plain
Image is not in qcow2 format
```

이는 ISO와 qcow2의 파일 형식이 다르기 때문에 발생한 오류였다. ISO는 `-cdrom` 옵션으로 연결해야 한다.




## 5. Red Hat 6.2 설치 과정

QEMU를 실행하면 Red Hat 설치 화면이 나타난다.

초기 `boot:` 프롬프트에서 다음을 입력하면 텍스트 모드 설치가 시작된다.

```plain
text
```

### 설치 옵션

| 화면 | 선택한 구성 |
| --- | --- |
| Language | English |
| Keyboard | US |
| Installation Method | Local CDROM |
| Installation Type | Custom |
| Partitioning | Disk Druid |
| Bootloader | LILO |
| Bootloader Location | MBR |
| Network | DHCP 또는 생략 |
| Time Zone | Asia/Seoul |
| Root Password | 직접 설정 |

위 표는 설치 과정에서 안내받은 권장 구성이며, 실제 선택한 모든 세부 항목이 확인된 것은 아니다.

### 파티션 구성 예시

4GB 디스크에서는 다음과 같이 구성할 수 있다.

| 파티션 | 크기 | 파일시스템 |
| --- | --- | --- |
| `/boot` | 25MB | ext2 |
| `swap` | 256MB | Linux swap |
| `/` | 나머지 공간 | ext2 |

시스템 보안 실습을 위해 개발 도구 관련 패키지도 함께 설치하는 것이 좋다.

설치 마지막에는 비상 부팅 플로피 디스크를 만들 것인지 묻는다.

```plain
Would you like to create a boot disk for your system?
```

QEMU에서는 별도 플로피가 필요하지 않아 `No`를 선택했다.




## 6. 설치 완료 후 일반 부팅

설치 완료 후에는 ISO를 제거하고 기존 qcow2 디스크로 부팅한다.

```plain
qemu-system-i386 \
  -machine pc \
  -accel tcg \
  -cpu pentium3 \
  -m 256 \
  -drive file="$HOME/Downloads/redhat62.qcow2",format=qcow2,if=ide \
  -boot c \
  -vga cirrus \
  -display cocoa,zoom-to-fit=on
```

설치 명령어와의 차이는 다음 두 가지다.

1. `-cdrom` 옵션 제거
2. `-boot d`를 `-boot c`로 변경

`-boot c`는 가상 하드디스크에서 부팅한다는 뜻이다.




## 7. 부팅 오류: hda: lost interrupt

설치 이후 부팅 중 다음 오류가 반복적으로 발생했다.

```plain
hda: lost interrupt
hda: lost interrupt
hda: lost interrupt
```

이 메시지는 IDE 디스크 작업에 필요한 인터럽트를 운영체제가 정상적으로 처리하지 못했음을 의미한다.

처음에는 디스크 인식 문제를 의심했지만, 시스템에서 `hda1`, `hda2` 등의 파티션은 확인되었다.

따라서 가상 디스크 파일이 존재하지 않는 문제는 아니었다.

QEMU의 구형 하드웨어 에뮬레이션과 Linux 2.2 커널의 인터럽트 처리 사이에서 호환성 문제가 발생한 것으로 추정했다.

### 시도한 방법

CPU와 ACPI 설정을 변경해 보았다.

```plain
qemu-system-i386 \
  -machine pc,acpi=off \
  -accel tcg \
  -cpu pentium,-apic \
  -m 256 \
  -drive file="$HOME/Downloads/redhat62.qcow2",format=qcow2,if=ide \
  -boot c \
  -vga cirrus \
  -display cocoa,zoom-to-fit=on
```

하지만 이 설정에서는 다음 오류가 나타났다.

```plain
Linux version 2.2.14-5.0smp

Kernel panic:
Kernel compiled for PPro+,
assumes local APIC without read-before-write bug
```

SMP 커널이 요구하는 CPU 및 APIC 조건과 변경된 CPU 설정이 맞지 않아 커널 패닉이 발생했다.

따라서 CPU 설정을 다시 `pentium3`으로 되돌렸다.




## 8. 해결: LILO에서 noapic 적용

최종적으로 부팅 성공에 사용한 방법은 **LILO 커널 부팅 옵션에 `noapic`을 추가하는 것**이었다.

QEMU 실행 후 다음 프롬프트가 나타나면:

```plain
LILO boot:
```

다음과 같이 입력했다.

```plain
linux noapic
```

이후 Red Hat Linux 6.2가 정상적으로 부팅되었다.

`noapic`은 커널이 I/O APIC을 사용하지 않도록 하는 옵션이다.

실제 부팅 결과:

```plain
Red Hat Linux release 6.2 (Zoot)
Kernel 2.2.14-5.0 on an i686
```

**이번 환경에서 가장 중요한 해결 방법은 `linux noapic`이었다.**

### 영구 적용 방법

부팅 후 다음 파일을 수정하면 매번 입력하는 번거로움을 줄일 수 있다.

```plain
vi /etc/lilo.conf
```

해당 Linux 커널 항목에 다음 설정을 추가한다.

```plain
append="noapic"
```

기존 `append=` 설정이 있다면 해당 줄에 옵션을 추가한다.

수정 후:

```plain
/sbin/lilo
```

단, 이번 작업에서 영구 적용까지 완료했는지는 별도로 확인하지 않았다.




## 9. GUI 대신 CLI 환경 사용

Red Hat 6.2 설치 과정에서 X Window 관련 설정을 진행할 수도 있다.

Xconfigurator에서는 그래픽 하드웨어 클럭 검사를 수행할지 묻는다.

```plain
Do you want to run 'X -probeonly' now?
```

구형 환경에서 그래픽 문제가 발생할 가능성을 줄이기 위해 `Skip`을 선택했다.

시스템 보안 실습에서는 GUI가 필요하지 않으므로 텍스트 모드를 사용하는 것이 편리하다.

기본 부팅을 CLI로 설정하려면 다음 파일을 수정한다.

```plain
vi /etc/inittab
```

```plain
id:5:initdefault:
```

를 다음과 같이 변경한다.

```plain
id:3:initdefault:
```

- Runlevel 3: 텍스트 기반 다중 사용자 모드
- Runlevel 5: 그래픽 로그인 모드




## 10. GCC 설치

Red Hat 6.2 설치 후 `gcc` 명령어가 없어 컴파일할 수 없는 문제가 있었다.

Red Hat 6.2는 현대 Linux처럼 `apt`나 `dnf`를 사용하는 환경이 아니므로, 설치 ISO 안의 RPM 패키지를 활용했다.

### ISO 연결

QEMU 실행 명령어에 설치 ISO를 다시 연결한다.

```plain
qemu-system-i386 \
  -machine pc \
  -accel tcg \
  -cpu pentium3 \
  -m 256 \
  -drive file="$HOME/Downloads/redhat62.qcow2",format=qcow2,if=ide \
  -cdrom "$HOME/Downloads/redhat62.iso" \
  -boot c \
  -vga cirrus \
  -display cocoa,zoom-to-fit=on
```

여기서 `-boot c`를 유지하므로 OS는 하드디스크에서 부팅한다.

Red Hat 내부에서는:

```plain
mount /dev/cdrom /mnt/cdrom
```

패키지 디렉터리 확인:

```plain
ls /mnt/cdrom/RedHat/RPMS
```

처음에는 ISO 없이 부팅해 다음 오류가 발생했다.

```plain
mount: No medium found
```

이 오류는 CD-ROM 장치는 있지만 삽입된 가상 매체가 없어서 발생한 것이었다.

### GCC 관련 패키지

Red Hat 6.2에서는 `egcs`가 C 컴파일러 패키지로 사용된다.

필요한 주요 패키지는 다음과 같다.

| 패키지 | 역할 |
| --- | --- |
| `egcs` | C 컴파일러 |
| `cpp` | C 전처리기 |
| `glibc-devel` | C 개발용 헤더 및 라이브러리 |
| `kernel-headers` | 커널 헤더 |
| `binutils` | 어셈블러 및 링커 |

설치 ISO의 RPM 디렉터리에서 패키지를 확인하고 설치한다.

```plain
cd /mnt/cdrom/RedHat/RPMS
```

```plain
rpm -Uvh cpp-*.rpm egcs-*.rpm glibc-devel-*.rpm kernel-headers-*.rpm
```

설치된 패키지와 의존성에 따라 추가 패키지가 필요할 수 있다.

설치 확인:

```plain
gcc --version
```

이후 C 프로그램을 컴파일할 수 있었다.

```plain
gcc -o bugfile bugfile.c
gcc -o eggshell eggshell.c
```




## 11. Mac과 Red Hat 간 파일 전송

Red Hat 6.2는 구형 시스템이므로 최신 SSH 서버를 바로 사용하기 어려울 수 있다.

또한 QEMU의 macOS Cocoa 화면에서 호스트와 게스트 간 클립보드 공유도 기본적으로 지원되지 않는 경우가 있다.

그래서 파일 전송에는 ISO를 사용하는 방법을 고려했다.

### Mac에서 전송용 ISO 생성

```plain
mkdir -p ~/Downloads/transfer
```

```plain
cp bugfile.c eggshell.c ~/Downloads/transfer/
```

```plain
hdiutil makehybrid \
  -iso -joliet \
  -o ~/Downloads/transfer.iso \
  ~/Downloads/transfer
```

### QEMU에 연결

기존 QEMU 실행 옵션의 `-cdrom`을 다음과 같이 변경한다.

```plain
-cdrom "$HOME/Downloads/transfer.iso"
```

Red Hat 내부에서:

```plain
mount -t iso9660 /dev/cdrom /mnt/cdrom
```

```plain
cp /mnt/cdrom/*.c /root/
```

이 방식은 SSH나 네트워크 설정 없이 파일을 전달할 수 있다는 장점이 있다.




## 12. 최종 정리

이번 작업을 통해 Apple Silicon Mac에서 QEMU를 이용하여 Red Hat Linux 6.2를 설치하고 실행할 수 있었다.

가장 어려웠던 부분은 오래된 Linux 커널과 최신 QEMU의 호환성 문제였다.

| 문제 | 해결 또는 확인 결과 |
| --- | --- |
| ISO를 qcow2로 인식 | ISO를 `-cdrom`으로 연결 |
| `hda: lost interrupt` | LILO에서 `linux noapic` 적용 후 부팅 성공 |
| Pentium CPU 설정 후 Kernel panic | Pentium III 설정으로 복구 |
| GUI 설정 | CLI 사용을 위한 Runlevel 3 설정 가능 |
| GCC 없음 | Red Hat 설치 ISO의 RPM 패키지 활용 |
| CD-ROM `No medium found` | QEMU에 ISO 연결 후 재시도 |
| 호스트·게스트 복사/붙여넣기 | 전송용 ISO 방식 사용 가능 |

구형 운영체제 실습에서는 최신 하드웨어 기능을 활성화하는 것보다, 당시 운영체제가 지원하던 하드웨어를 최대한 비슷하게 에뮬레이션하는 것이 중요하다는 점을 확인할 수 있었다.

또한 `linux noapic`처럼 커널 부팅 옵션 하나가 시스템 실행 가능 여부에 큰 영향을 줄 수 있다는 것도 확인했다.

Red Hat 6.2는 현재 보안 업데이트가 제공되지 않는 운영체제이므로, 네트워크에서 격리된 실습용 가상머신으로 사용하는 것이 적절하다.
