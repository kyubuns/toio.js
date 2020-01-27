/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EventEmitter } from 'events'
import TypedEmitter from 'typed-emitter'
import { Characteristic } from 'noble-mac'
import { MotorSpec } from './specs/motor-spec'

/**
 * @hidden
 */
export interface Event {
  'motor:move-to-position': (code: number) => void
}

/**
 * @hidden
 */
export class MotorCharacteristic {
  public static readonly UUID = '10b201025b3b45719508cf3efcd7bbae'

  private readonly characteristic: Characteristic

  private readonly spec = new MotorSpec()

  private timer: NodeJS.Timer | null = null

  private pendingResolve: (() => void) | null = null

  private readonly eventEmitter: TypedEmitter<Event> = new EventEmitter() as TypedEmitter<Event>

  public constructor(characteristic: Characteristic) {
    this.characteristic = characteristic
    if (this.characteristic.properties.includes('notify')) {
      this.characteristic.on('data', this.onData.bind(this))
    }
  }

  public move(left: number, right: number, durationMs: number): Promise<void> | void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    if (this.pendingResolve) {
      this.pendingResolve()
      this.pendingResolve = null
    }

    const data = this.spec.move(left, right, durationMs)
    this.characteristic.write(Buffer.from(data.buffer), false)

    if (data.data.durationMs > 0) {
      return new Promise(resolve => {
        this.pendingResolve = resolve
        this.timer = setTimeout(() => {
          if (this.pendingResolve) {
            this.pendingResolve()
            this.pendingResolve = null
          }
        }, data.data.durationMs)
      })
    }
  }

  public moveToPosition(x: number, y: number, angle: number, moveType: number, maxSpeed: number, speedType: number): Promise<number> | void {
    return new Promise((resolve, reject) => {
      this.characteristic.subscribe(error => {
        if (error) {
          reject(error)
        } else {
          const data = this.spec.moveToPosition(x, y, angle, moveType, maxSpeed, speedType)
          this.characteristic.write(Buffer.from(data.buffer), false)
          this.eventEmitter.once('motor:move-to-position', code => {
            this.characteristic.unsubscribe()
            resolve(code)
          })
        }
      })
    })
  }

  public stop(): void {
    this.move(0, 0, 0)
  }

  private data2result(data: Buffer): void {
    const type = data.readUInt8(0)
    if (type === 0x83) {
      const code = data.readUInt8(2)
      this.eventEmitter.emit('motor:move-to-position', code)
      return
    }
  }

  private onData(data: Buffer): void {
    this.data2result(data)
  }
}
