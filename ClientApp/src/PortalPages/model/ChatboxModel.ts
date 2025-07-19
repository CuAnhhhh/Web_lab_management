/* eslint-disable @typescript-eslint/no-namespace */
export namespace Chatbox {
  export interface ChatboxModel {
    messageId?: string;
    sendId?: string;
    receiveId?: string;
    message?: string;
    messageType?: boolean;
    timeStamp?: string;
  }

  export interface ChatboxResponseModel {
    isDone?: boolean;
    error?: string;
    messageList?: ChatboxModel[];
  }
}
