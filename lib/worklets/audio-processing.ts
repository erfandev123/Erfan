/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const AudioRecordingWorklet = `
class AudioProcessingWorklet extends AudioWorkletProcessor {
  // send and clear buffer every 512 samples for lower latency
  buffer = new Int16Array(512);

  // current write index
  bufferWriteIndex = 0;

  _inputBuffer = new Float32Array(0);
  _resampleRatio = 1;

  constructor(options) {
    super();
    if (options && options.processorOptions) {
      const { nativeSampleRate, targetSampleRate } = options.processorOptions;
      if (nativeSampleRate && targetSampleRate && nativeSampleRate !== targetSampleRate) {
        this._resampleRatio = nativeSampleRate / targetSampleRate;
      }
    }
  }

  process(inputs) {
    const input = inputs[0][0];
    if (!input) {
      return true;
    }

    if (this._resampleRatio === 1) {
        // No resampling needed
        this.processChunk(input);
        return true;
    }

    // Append new data to the buffer
    const newBuffer = new Float32Array(this._inputBuffer.length + input.length);
    newBuffer.set(this._inputBuffer);
    newBuffer.set(input, this._inputBuffer.length);
    this._inputBuffer = newBuffer;

    let outputIndex = 0;
    let lastInputIndex = 0;
    
    while (true) {
        const inputIndex = outputIndex * this._resampleRatio;
        const floorIndex = Math.floor(inputIndex);
        const ceilIndex = floorIndex + 1;
        
        if (ceilIndex >= this._inputBuffer.length) {
            break;
        }
        
        const fraction = inputIndex - floorIndex;
        const sample = this._inputBuffer[floorIndex] * (1 - fraction) + this._inputBuffer[ceilIndex] * fraction;

        // Clamp the value to the 16-bit signed integer range
        const int16Value = Math.max(-32768, Math.min(32767, sample * 32768));
        this.buffer[this.bufferWriteIndex++] = int16Value;

        if (this.bufferWriteIndex >= this.buffer.length) {
          this.sendAndClearBuffer();
        }
        
        outputIndex++;
        lastInputIndex = floorIndex;
    }
    
    // Keep unprocessed part of the buffer
    this._inputBuffer = this._inputBuffer.slice(lastInputIndex);

    return true;
  }

  sendAndClearBuffer(){
    if (this.bufferWriteIndex === 0) return;
    this.port.postMessage({
      event: "chunk",
      data: {
        int16arrayBuffer: this.buffer.slice(0, this.bufferWriteIndex).buffer,
      },
    });
    this.bufferWriteIndex = 0;
  }

  // This is used only when no resampling is needed
  processChunk(float32Array) {
    const l = float32Array.length;
    for (let i = 0; i < l; i++) {
      // Clamp the value to the 16-bit signed integer range
      const int16Value = Math.max(-32768, Math.min(32767, float32Array[i] * 32768));
      this.buffer[this.bufferWriteIndex++] = int16Value;
      if(this.bufferWriteIndex >= this.buffer.length) {
        this.sendAndClearBuffer();
      }
    }
  }
}
`;

export default AudioRecordingWorklet;
