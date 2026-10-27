---
title: Multiplexing
tags:
  - 데이터통신
draft: false
---

## Multiplexing

여러 신호를 하나의 물리적 링크로 전송하는 기술.

- **MUX (Multiplexer)**: 여러 신호를 하나로 합침.
- **DEMUX (Demultiplexer)**: 합쳐진 신호를 다시 분리.
- **종류**: FDM, WDM, TDM

### 1. FDM (Frequency Division Multiplexing)

주파수 분할 다중화 방식.

- 서로 다른 주파수 대역에 신호를 배치하여 동시에 전송.
- 수신 측에서는 **Filter**를 이용해 주파수별로 분리한 후 복조.
- 채널 간 간섭 방지를 위해 **Guard Band** 사용.

**16-QAM 예시**

- 디지털 신호를 16-QAM으로 아날로그 신호로 변조한 뒤 FDM으로 다중화.
- 16-QAM은 1심볼당 4bit 전송.
- 1 Mbps ÷ 4 = 250 kbaud (이상적인 조건에서 최소 대역폭 250 kHz).

### 2. WDM (Wavelength Division Multiplexing)

파장 분할 다중화 방식.

- 서로 다른 빛의 파장을 이용해 하나의 광섬유로 여러 신호를 전송.
- 수신 측에서는 파장별로 신호를 분리.
- FDM과 원리는 유사하지만 **광 신호의 파장**을 이용.

### 3. TDM (Time Division Multiplexing)

시분할 다중화 방식.

- 여러 디지털 신호가 시간을 나누어 하나의 링크를 공유.
- **Frame**: 여러 Slot으로 구성된 전송 단위.
- **Slot**: 각 채널에 할당되는 시간 구간.
- 입력 데이터율과 각 채널에 할당된 출력 용량이 일치해야 함.

**핵심 공식**

- Frame rate = 입력 채널의 Bit rate ÷ 채널당 Frame에 포함된 Bit 수
- Frame duration = 1 / Frame rate
- Slot duration = Frame duration / Slot 개수

**Example 6 — 1byte씩 전송**

4개 채널이 각각 100 bytes/s로 전송하는 경우

- Frame 크기 = 4 × 8 = 32 bits
- Frame rate = 100 frames/s
- Frame duration = 1/100 = **10 ms**
- 출력 Bit rate = 100 × 32 = **3,200 bps**

**Example 7 — 2bit씩 전송**

4개 채널이 각각 100 kbps로 전송하는 경우

- Frame 크기 = 4 × 2 = 8 bits
- Frame rate = 100,000 / 2 = **50,000 frames/s**
- Frame duration = 1/50,000 = **20 μs**
- Slot duration = 20/4 = **5 μs**
- 출력 Bit rate = 50,000 × 8 = **400 kbps**

#### Synchronizing (동기화 비트)

- MUX와 DEMUX 간 프레임 경계를 구별하기 위해 **Framing Bit(동기화 비트)** 사용.
- 일반적으로 각 Frame의 시작에 1bit 추가.
- 동기화 비트는 0과 1을 번갈아 사용하는 방식이 대표적.

**Example 8 — 동기화 비트 추가**

4개 채널이 각각 250 characters/s로 데이터를 전송하고, Frame마다 동기화 비트 1개를 추가하는 경우.

- 1 character = 8 bits
- 입력 Bit rate = 250 × 8 = **2 kbps**
- Character duration = 1/250 = **4 ms**
- Frame rate = **250 frames/s**
- Frame duration = **4 ms**
- Frame 크기 = (4 × 8) + 1 = **33 bits**
- 출력 Bit rate = 250 × 33 = **8,250 bps**
