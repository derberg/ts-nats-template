import { File } from '@asyncapi/generator-react-sdk';
import { Events } from '../../components/events';
import { getStandardClassCode, getStandardHeaderCode } from '../../components/index/standard';
import { Publish } from '../../components/index/publish';
import { Subscribe } from '../../components/index/subscribe';
import { Reply } from '../../components/index/reply';
import { Request } from '../../components/index/request';
import { camelCase, pascalCase, isRequestReply, isReplier, isRequester, isPubsub} from '../../utils/index';

// eslint-disable-next-line sonarjs/cognitive-complexity
/**
 * Return the correct channel functions for the client based on whether a channel is `pubSub` or `requestReply`.
 * 
 * @param {*} asyncapi 
 * @param {*} params 
 */
function getChannelWrappers(asyncapi, params) {
  let channelWrappers = [];
  channelWrappers = Object.keys(asyncapi.channels()).length ? Object.entries(asyncapi.channels()).map(([channelName, channel]) => {
    const publishMessage = channel.publish() ? channel.publish().message(0) : undefined;
    const subscribeMessage = channel.subscribe() ? channel.subscribe().message(0) : undefined;
    const defaultContentType = asyncapi.defaultContentType();
    const channelDescription = channel.description();
    const channelParameters = channel.parameters();
    if (isRequestReply(channel)) {
      if (isRequester(channel)) {
        return Request(
          defaultContentType, 
          channelName, 
          subscribeMessage,
          publishMessage,
          channelDescription,
          channelParameters
        );
      }
      if (isReplier(channel)) {
        return Reply(
          defaultContentType, 
          channelName, 
          subscribeMessage,
          publishMessage,
          channelDescription,
          channelParameters,
          params
        );
      }
    }

    if (isPubsub(channel)) {
      if (channel.hasSubscribe()) {
        return Publish(
          defaultContentType, 
          channelName, 
          subscribeMessage, 
          channelDescription, 
          channelParameters);
      }
      if (channel.hasPublish()) {
        return Subscribe(
          defaultContentType, 
          channelName, 
          publishMessage, 
          channelDescription, 
          channelParameters);
      }
    }
  }) : '';
  return channelWrappers;
}


export default function index({ asyncapi, params }) {

  return (
    <File name="index.ts">
{`

import {AvailableHooks, receivedDataHook, BeforeSendingDataHook, Hooks} from './hooks';
import * as TestClient from './tests/testclient/';
${getStandardHeaderCode(asyncapi, '.', './channels')}
export {ErrorCode, NatsTypescriptTemplateError}
export {TestClient};
export {AvailableHooks, receivedDataHook, BeforeSendingDataHook, Hooks}
export {Client, ServerInfo, ServersChangedEvent, SubEvent}

export declare interface NatsAsyncApiClient {
  ${Events()}
}

export class NatsAsyncApiClient extends events.EventEmitter{
  ${getStandardClassCode(asyncapi)}
  ${getChannelWrappers(asyncapi, params).join('')}
}
`}
    </File>
  );
}