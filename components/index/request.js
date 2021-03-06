import { pascalCase, camelCase, getMessageType, realizeParametersForChannelWrapper, getClientToUse, realizeParametersForChannelWithoutType} from '../../utils/index';

/**
 * Component which returns a request to function for the client
 * 
 * @param {*} defaultContentType 
 * @param {*} channelName to request to 
 * @param {*} requestMessage to request
 * @param {*} replyMessage to receive
 * @param {*} messageDescription 
 * @param {*} channelParameters parameters to the channel
 */
export function Request(defaultContentType, channelName, requestMessage, replyMessage, messageDescription, channelParameters) {
  return `
    /**
     *  ${messageDescription}
     * @param requestMessage The request message to send.
     */
     public request${pascalCase(channelName)}(
       requestMessage:${getMessageType(requestMessage)} 
        ${realizeParametersForChannelWrapper(channelParameters)}
     ): Promise<${getMessageType(replyMessage)}> {
      ${getClientToUse(requestMessage, defaultContentType)}
       if(nc){
         return ${camelCase(channelName)}Channel.request(
           requestMessage, 
           nc
           ${Object.keys(channelParameters).length ? `,${realizeParametersForChannelWithoutType(channelParameters)}` : ''}
         );
       }else{
         return Promise.reject(NatsTypescriptTemplateError.errorForCode(ErrorCode.NOT_CONNECTED));
       }
     }
    `;
}