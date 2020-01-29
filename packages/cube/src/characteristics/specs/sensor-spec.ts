/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * @hidden
 */
export interface DataType {
  buffer: Uint8Array
  data: {
    isSloped: boolean
    isCollisionDetected: boolean
    isDoubleTapDetected: boolean
    attitude: number
  }
  dataType: 'sensor:detection'
}

/**
 * @hidden
 */
export class SensorSpec {
  public parse(buffer: Buffer): DataType {
    if (buffer.byteLength < 5) {
      throw new Error('parse error')
    }

    const type = buffer.readUInt8(0)
    if (type !== 1) {
      throw new Error('parse error')
    }

    const isSloped = buffer.readUInt8(1) === 0
    const isCollisionDetected = buffer.readUInt8(2) === 1
    const isDoubleTapDetected = buffer.readUInt8(3) === 1
    const attitude = buffer.readUInt8(4)

    return {
      buffer: buffer,
      data: {
        isSloped: isSloped,
        isCollisionDetected: isCollisionDetected,
        isDoubleTapDetected: isDoubleTapDetected,
        attitude: attitude,
      },
      dataType: 'sensor:detection',
    }
  }
}
