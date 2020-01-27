/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { clamp } from '../../util'

/**
 * @hidden
 */
export interface MoveType {
  buffer: Uint8Array
  data: { left: number; right: number; durationMs: number }
}

/**
 * @hidden
 */
export class MotorSpec {
  public move(left: number, right: number, durationMs: number = 0): MoveType {
    const lSign = left > 0 ? 1 : -1
    const rSign = right > 0 ? 1 : -1
    const lDirection = left > 0 ? 1 : 2
    const rDirection = right > 0 ? 1 : 2
    const lPower = Math.min(Math.abs(left), 100)
    const rPower = Math.min(Math.abs(right), 100)
    const duration = clamp(durationMs / 10, 0, 255)

    return {
      buffer: Buffer.from([2, 1, lDirection, lPower, 2, rDirection, rPower, duration]),
      data: {
        left: lSign * lPower,
        right: rSign * rPower,
        durationMs: duration * 10,
      },
    }
  }

  public moveToPosition(x: number, y: number, angle: number, moveType: number, maxSpeed: number, speedType: number): MoveType {
    const buf = Buffer.alloc(13)
    buf.writeUInt8(3, 0)
    buf.writeUInt8(0, 1)
    buf.writeUInt8(5, 2)
    buf.writeUInt8(moveType, 3)
    buf.writeUInt8(maxSpeed, 4)
    buf.writeUInt8(speedType, 5)
    buf.writeUInt8(0, 6)
    buf.writeUInt16LE(x, 7)
    buf.writeUInt16LE(y, 9)
    buf.writeUInt16LE(angle, 11)

    return {
      buffer: buf,
      data: {
        left: 100,
        right: 100,
        durationMs: 0,
      },
    }
  }
}
