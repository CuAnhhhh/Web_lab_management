import axios from "axios";
import { Chatbox } from "../model/ChatboxModel";

const api = "http://26.243.146.110:7051";

export async function getMessage(
  model: Chatbox.ChatboxModel
): Promise<Chatbox.ChatboxResponseModel> {
  const response = await axios.post(`${api}/chatbox/getmessage`, model);
  return response.data;
}
