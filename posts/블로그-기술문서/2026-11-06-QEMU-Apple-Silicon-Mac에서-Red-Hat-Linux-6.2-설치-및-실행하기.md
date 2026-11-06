---
title: '[QEMU] Apple Silicon Mac에서 Red Hat Linux 6.2 설치 및 실행하기'
draft: false
---

# 

## 1. 개요

시스템 보안 수업에서 스택 버퍼 오버플로우 실습을 진행하기 위해 오래된 Linux 환경이 필요했다.

처음에는 Ubuntu 16.04를 Docker에서 실행했지만, GCC의 스택 배치 방식과 ASLR 등의 차이 때문에 강의자료와 동일한 결과를 재현하기 어려웠다.

따라서 강의자료에서 사용한 **Red Hat Linux 6.2**를 Apple Silicon Mac에서 QEMU로 실행하기로 했다.

### 실습 환경

| 항목 | 설정 |
| --- | --- |
| 호스트 OS | macOS (Apple Silicon) |
| 에뮬레이터 | QEMU 11.1.3 |
| 게스트 OS | Red Hat Linux 6.2 (Zoot) |
| 아키텍처 | i386 (32비트 x86) |
| CPU | Pentium III |
| RAM | 256MB |
| 가상 디스크 | qcow2, 4GB |
| 디스크 인터페이스 | IDE |
| 그래픽 | Cirrus VGA |
| 부팅 방식 | Legacy BIOS / LILO |
| 에뮬레이션 | TCG |

Apple Silicon은 ARM64 아키텍처이므로 QEMU의 **TCG(Tiny Code Generator)** 를 사용하여 x86 CPU를 소프트웨어로 에뮬레이션했다.




## 2. QEMU 설치

Homebrew를 이용하여 설치한다.

```plain
brew install qemu
```

설치 후 버전을 확인한다.

```plain
qemu-system-i386 --version
```

실습 당시 출력된 버전은 다음과 같다.

```plain
QEMU emulator version 11.1.3
```

`qemu-system-i386`은 32비트 x86 시스템을 에뮬레이션하는 프로그램이다.




## 3. Red Hat Linux 6.2 설치 준비

필요한 파일은 다음과 같다.

| 파일 | 용도 |
| --- | --- |
| `redhat62.iso` | 운영체제 설치 이미지 |
| `redhat62.qcow2` | 가상 하드디스크 |

ISO 파일 위치:

```plain
~/Downloads/redhat62.iso
```

### 가상 하드디스크 생성

```plain
qemu-img create -f qcow2 \
  "$HOME/Downloads/redhat62.qcow2" 4G
```

`qcow2`는 QEMU에서 사용하는 가상 디스크 이미지 형식이다.

기존에 설치한 디스크가 존재한다면 이 명령어를 다시 실행하지 않아야 한다.




## 4. Red Hat 6.2 설치

다음 명령어로 설치를 시작한다.

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

| 옵션 | 의미 |
| --- | --- |
| `-machine pc` | 기존 PC 하드웨어 에뮬레이션 |
| `-accel tcg` | 소프트웨어 CPU 에뮬레이션 |
| `-cpu pentium3` | Pentium III CPU |
| `-m 256` | 메모리 256MB |
| `-drive` | 가상 디스크 연결 |
| `if=ide` | IDE 인터페이스 지정 |
| `-cdrom` | 설치 ISO 연결 |
| `-boot d` | CD-ROM 우선 부팅 |
| `-vga cirrus` | 구형 그래픽 장치 |
| `zoom-to-fit=on` | 창 크기에 맞춰 화면 확대 |

처음에는 ISO 파일을 qcow2 디스크로 지정해서 다음 오류가 발생했다.

```plain
Image is not in qcow2 format
```

ISO는 `-cdrom`으로, qcow2 파일은 `-drive`로 연결하면 된다.




## 5. 운영체제 설치 과정

처음 설치 화면에서 다음을 입력한다.

```plain
boot: text
```

이후 텍스트 기반 설치 화면으로 진행한다.

### 설치 항목

| 화면 | 설정 |
| --- | --- |
| Language | English |
| Keyboard | US |
| Installation Method | Local CDROM |
| Installation Type | Custom |
| Disk Partitioning | Disk Druid |
| Bootloader | LILO |
| Bootloader Location | MBR |
| Network | DHCP 또는 생략 |
| Time Zone | Asia/Seoul |
| Root Password | 직접 설정 |

위 내용은 당시 사용한 설치 구성과 권장 설정을 정리한 것이며, 모든 선택 항목의 실제 기록이 남아 있는 것은 아니다.

### 파티션 구성 예시

| 파티션 | 크기 | 파일시스템 |
| --- | --- | --- |
| `/boot` | 25MB | ext2 |
| `swap` | 256MB | Linux swap |
| `/` | 나머지 공간 | ext2 |

시스템 보안 실습이 목적이라면 GCC 등의 개발 도구를 설치하는 것이 좋다.

설치 마지막에는 비상 부팅 디스크를 만들 것인지 묻는다.

```plain
Would you like to create a boot disk for your system?
```

QEMU에서는 별도 플로피 디스크가 필요하지 않으므로 `No`를 선택했다.




## 6. 설치 후 부팅

설치를 완료하면 ISO 없이 가상 디스크로 부팅한다.

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

설치 명령어와의 주요 차이는 다음과 같다.

- `-cdrom` 제거
- `-boot d`를 `-boot c`로 변경

`-boot c`는 가상 하드디스크에서 부팅한다는 뜻이다.




## 7. 부팅 오류: hda: lost interrupt

설치 이후 부팅 과정에서 다음 오류가 반복됐다.

```plain
hda: lost interrupt
hda: lost interrupt
hda: lost interrupt
```

이는 IDE 디스크 작업 중 필요한 인터럽트를 정상적으로 처리하지 못했다는 뜻이다.

디스크 파티션 자체는 인식됐으므로 가상 디스크 파일이 존재하지 않는 문제는 아니었다.

QEMU와 Linux 2.2 커널 사이의 인터럽트 호환성 문제가 의심됐다.

### CPU 설정 변경 시도

CPU를 구형 Pentium으로 바꾸고 APIC을 비활성화해 보았다.

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

그러나 다음 오류가 발생했다.

```plain
Linux version 2.2.14-5.0smp

Kernel panic:
Kernel compiled for PPro+,
assumes local APIC without read-before-write bug
```

SMP 커널과 CPU 설정의 호환성 문제로 커널 패닉이 발생한 것으로 판단했다.

따라서 CPU는 다시 Pentium III로 설정했다.




## 8. 해결: LILO에서 noapic 설정

최종적으로 **`linux noapic` 명령어를 입력해 정상 부팅에 성공**했다.

QEMU 실행 후 다음 화면이 나타나면:

```plain
LILO boot:
```

아래 명령어를 입력한다.

```plain
linux noapic
```

`noapic`은 I/O APIC 사용을 비활성화하는 Linux 커널 부팅 옵션이다.

정상 부팅 후 다음 화면을 확인했다.

```plain
Red Hat Linux release 6.2 (Zoot)
Kernel 2.2.14-5.0 on an i686
```

이번 환경에서는 `noapic`을 적용하여 IDE 인터럽트 문제를 해결할 수 있었다.

### noapic 영구 설정

매번 입력하지 않으려면 LILO 설정을 변경할 수 있다.

```plain
vi /etc/lilo.conf
```

Linux 커널 부팅 항목에 다음 줄을 추가한다.

```plain
append="noapic"
```

기존 `append=` 항목이 있다면 그 줄에 `noapic`을 추가한다.

설정을 저장하고 다음을 실행한다.

```plain
/sbin/lilo
```

이 과정은 영구 적용 방법이며, 이번 실습에서 영구 적용 성공 여부까지 확인한 것은 아니다.




## 9. GUI 대신 CLI 사용

Red Hat 6.2 설치 과정에서 X Window 설정 화면이 나타날 수 있다.

Xconfigurator에서 다음 메시지가 출력됐다.

```plain
Do you want to run 'X -probeonly' now?
```

그래픽 하드웨어 자동 검사를 건너뛰기 위해 `Skip`을 선택했다.

시스템 보안 실습은 CLI 환경이면 충분하므로 텍스트 모드로 부팅하도록 설정할 수 있다.

```plain
vi /etc/inittab
```

다음 줄을 찾는다.

```plain
id:5:initdefault:
```

아래처럼 변경한다.

```plain
id:3:initdefault:
```

- Runlevel 3: 텍스트 기반 다중 사용자 모드
- Runlevel 5: 그래픽 로그인 모드




## 10. GCC 설치

Red Hat 6.2를 설치한 뒤 `gcc` 명령어가 없어 컴파일할 수 없는 문제가 있었다.

현대 Linux와 달리 오래된 Red Hat에서는 설치 ISO에 포함된 RPM 패키지로 컴파일러를 설치할 수 있다.

### ISO 다시 연결하기

운영체제는 하드디스크로 부팅하고 ISO는 CD-ROM으로 연결한다.

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

Red Hat에서 다음을 실행한다.

```plain
mount /dev/cdrom /mnt/cdrom
```

패키지 확인:

```plain
ls /mnt/cdrom/RedHat/RPMS
```

처음에는 ISO 없이 실행했기 때문에 다음 오류가 발생했다.

```plain
mount: No medium found
```

`-cdrom` 옵션으로 ISO를 연결한 뒤 해결했다.

### GCC 패키지 설치

Red Hat 6.2에서는 `egcs`가 GCC 기반 C 컴파일러 패키지로 제공된다.

필요한 주요 패키지는 다음과 같다.

| 패키지 | 용도 |
| --- | --- |
| `egcs` | C 컴파일러 |
| `cpp` | 전처리기 |
| `glibc-devel` | C 개발용 헤더 |
| `kernel-headers` | 커널 헤더 |
| `binutils` | 링커 및 어셈블러 |

RPM 디렉터리로 이동한다.

```plain
cd /mnt/cdrom/RedHat/RPMS
```

필요한 패키지를 설치한다.

```plain
rpm -Uvh cpp-*.rpm egcs-*.rpm glibc-devel-*.rpm kernel-headers-*.rpm
```

환경에 따라 의존성 패키지를 추가해야 할 수 있다.

설치 확인:

```plain
gcc --version
```

정상적으로 버전이 출력되면 C 프로그램을 컴파일할 수 있다.




## 11. Mac에서 Red Hat으로 파일 전송

구형 Red Hat 6.2는 최신 macOS와 SSH 프로토콜 호환성 문제가 있을 수 있다.

QEMU Cocoa 환경에서는 복사·붙여넣기도 기본적으로 지원되지 않을 수 있다.

따라서 **ISO 파일을 이용한 전송 방법**을 사용할 수 있다.

### Mac에서 ISO 생성

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

### QEMU에 ISO 연결

QEMU 실행 옵션에 다음을 추가한다.

```plain
-cdrom "$HOME/Downloads/transfer.iso"
```

Red Hat에서:

```plain
mount -t iso9660 /dev/cdrom /mnt/cdrom
```

파일 복사:

```plain
cp /mnt/cdrom/*.c /root/
```

이 방식은 SSH 서버가 없어도 호스트에서 게스트로 파일을 전달할 수 있다.




## 12. 최종 결과

QEMU 11.1.3을 이용해 Apple Silicon Mac에서 Red Hat Linux 6.2를 설치하고 부팅했다.

핵심 문제는 최신 QEMU와 구형 Linux 커널 사이의 호환성이었다.

| 문제 | 해결 또는 확인 결과 |
| --- | --- |
| ISO 형식 오류 | `-cdrom` 사용 |
| `hda: lost interrupt` | LILO의 `linux noapic`으로 해결 |
| CPU 설정 변경 후 Kernel panic | Pentium III로 복구 |
| GUI 실행 | Runlevel 3으로 CLI 부팅 가능 |
| GCC 미설치 | ISO에 포함된 RPM 패키지 설치 |
| `No medium found` | CD-ROM에 ISO 연결 |
| 파일 전송 | ISO 파일 활용 가능 |

오래된 운영체제를 실행할 때는 최신 하드웨어 기능보다 해당 시대의 하드웨어와 호환되는 에뮬레이션 환경을 구성하는 것이 중요하다는 점을 알 수 있었다.




# 13. 최종 실행 명령어 모음 (Cheat Sheet)

나중에 다시 설정할 때 사용할 수 있도록 주요 명령어를 정리했다.

## ① QEMU 설치 및 버전 확인

```plain
brew install qemu
qemu-system-i386 --version
```

## ② 최초 디스크 생성 (설치 전 한 번만)

```plain
qemu-img create -f qcow2 \
  "$HOME/Downloads/redhat62.qcow2" 4G
```

**기존 디스크가 있다면 절대 다시 실행하지 않는다.**

## ③ Red Hat 6.2 최초 설치

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

설치 시작:

```plain
boot: text
```

## ④ 일반 부팅 — 가장 자주 사용할 명령어

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

**LILO 화면에서 반드시 입력:**

```plain
linux noapic
```

이번 실습 환경에서 정상 부팅을 확인한 방법이다.

## ⑤ GCC 설치 또는 설치 ISO 사용 시

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

Red Hat 내부:

```plain
mount /dev/cdrom /mnt/cdrom
cd /mnt/cdrom/RedHat/RPMS
```

```plain
rpm -Uvh cpp-*.rpm egcs-*.rpm glibc-devel-*.rpm kernel-headers-*.rpm
```

## ⑥ Mac에서 C 파일을 전달할 때

Mac에서:

```plain
mkdir -p ~/Downloads/transfer
cp bugfile.c eggshell.c ~/Downloads/transfer/
hdiutil makehybrid -iso -joliet \
  -o ~/Downloads/transfer.iso \
  ~/Downloads/transfer
```

전송용 ISO를 연결하여 실행:

```plain
qemu-system-i386 \
  -machine pc \
  -accel tcg \
  -cpu pentium3 \
  -m 256 \
  -drive file="$HOME/Downloads/redhat62.qcow2",format=qcow2,if=ide \
  -cdrom "$HOME/Downloads/transfer.iso" \
  -boot c \
  -vga cirrus \
  -display cocoa,zoom-to-fit=on
```

Red Hat에서:

```plain
mount -t iso9660 /dev/cdrom /mnt/cdrom
cp /mnt/cdrom/*.c /root/
```

## ⑦ C 파일 컴파일

```plain
cd /root

gcc -o bugfile bugfile.c
gcc -o eggshell eggshell.c
```

## ⑧ noapic 영구 적용

```plain
vi /etc/lilo.conf
```

해당 커널 항목에:

```plain
append="noapic"
```

저장한 뒤:

```plain
/sbin/lilo
```

## ⑨ Red Hat 버전 및 환경 확인

```plain
uname -a
cat /etc/redhat-release
gcc --version
```

### 최종 핵심 요약

- **처음 설치:** `-cdrom redhat62.iso -boot d`
- **일반 실행:** `-boot c`
- **GCC 설치:** ISO 연결 후 RPM 사용
- **Mac 파일 전송:** `transfer.iso` 생성 및 연결
- **부팅 오류 해결:** LILO에서 `linux noapic`
- **기존 qcow2 파일은 보존하고 다시 생성하지 않기**

이 글의 명령어들은 macOS의 `$HOME/Downloads`에 Red Hat 6.2 ISO와 qcow2 디스크를 저장한 환경을 기준으로 한다.
