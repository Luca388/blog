---
title: "Intel 64 and IA-32 Architectures Manual"
tags: ["assembly"]
---

![Alt text](https://modoocode.com/img/inst/op.png)

> 'A. 2.1 Codes for Addressing Method' 과 'A.2.2 Codes for Operand Type'에 설명되어있다

# 자주사용되는 Addressing Method
## E
A ModR/M byte follows the opcode and specifies the operand.The operand is either a general-purpose register or a memory address.
## G
The reg field of the ModR/M byte selects a general register (for example,AX (100)).
## I
Immediate data:the operand value is encoded in subsequent bytes of the instruction.
## J 
The instruction contains a relative offset to be added to the instruction pointer register(for example,JMP (0E9),LOOP).
## M
The ModR/M byte may refer only to memory (for example, BOUND, LES, LDS, LSS, LFS, LGS, CMPXCHG8B).
## X
Memory addressed by the DS:rSI register pair (for example, MOVS, CMPS, OUTS, or LODS).
## Y
Memory addressed by the ES:rDI register pair (for example, MOVS, CMPS, INS, STOS, or SCAS).
# 자주사용되는 Operand Type
## b
Byte, regardless of operand-size attribute.
## d
Doubleword, regardless of operand-size attribute.
## v
Word, doubleword or quadword (in 64-bit mode), depending on operand-size attribute.
## z 
Word for 16-bit operand-size or doubleword for 32 or 64-bit operand-size.

# ModR/M
Opcode를 도와서 Operand를 설명하는 수단으로 사용.(옵션)
> Operand 의 형태가 E 또는 G라면 Opcode 뒤에 반드시 ModR/M이 따라온다.

ModR/M의 값이 00~BF인 경우 E 영역에 표시된 Operand의 형태는 Memory Address이고 ,C0~FF인 경우 Register이다.
# Group
Group 명령문은 Opcode 를 ModR/M과 조합하여 최대 8가지 형태의 명령어 (Mnemonic)를 가질 수 있는 Opcode들을 뜻한다.
Group 명령어를 잘 활용하면 해석이 좀 복잡해지는 대신 Opcode Map을 확장시키는 효과를 얻을 수 있다.


> Opcode가 Group명령문인경우 무조건 ModR/M이 따라온다
> Group 명령어 테이브은 Opcode Manual 의 'Table A-6.Opcode Extentions for One- and Two Opcodes by Group Number' 에 나타나있다.

# Prefix
Prefix 66의 의미는 32비트 크기의 operand를 16비트 크기의 (또는 16비트 크기의 Operand 를 32비트 크기로)인식하도록 만든다.

# 2 바이트 Opcode
첫 바이트는 0F로 고정되어 있어서 Opcode Map에서 찾는 방식은 1바이트 Opcode와 동일하다.
# SIB 
ModR/M을 보조할때 사용 (옵션)
Opcode의 Operand가 Memory Address 인 경우 ModR/M과 함께 사용된다.

SIB는 Operand가 Memory Address를 가리킬 때 사용된다.Instruction에 SIB가 존재하면 가장 복잡한 형태라고 볼 수 있다.

[--][--] 기호는 정확한 주소를 표현하기 위해 SIB 바이트가 필요한다는 뜻이다.
> [--][--] = [(Reg. A)+(Reg. B)]

SIB 테이블은 Opcode Manual의 'Table 2-3'에 나와있다.