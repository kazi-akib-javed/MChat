import { Injectable, signal } from "@angular/core";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { environment } from "../../env/env.dev";
import { Ichat } from "../interface/chat-response";

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private supabase!: SupabaseClient;
  public savedChat = signal<Ichat>({} as Ichat);
  public allChats = signal<Ichat[]>([]);
  public requestAction = signal<string>("");
  public receiverId = signal<string>("");
  public selectedChat = signal<boolean>(false);
  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  async getCurrentUser() {
    const user = await this.supabase.auth.getUser().then((res) => res);
    return user;
  }

  async sendMessage(text: string) {
    try {
      const receiver: string = this.receiverId();
      const { data, error } = await this.supabase
        .from("chats")
        .insert({ text, receiver });
      if (error) {
        alert(error.message);
        return null;
      }
      return data;
    } catch (error) {
      alert(error);
      return null;
    }
  }

  subscribeToChats(receiverId: string, senderId: string) {
    const sortedIds = [receiverId, senderId].sort(); // ensures consistency
    const channelName = `chat-room-${sortedIds[0]}-${sortedIds[1]}`; // same for both users
    //improvement if it's not worikng with other person then we need to add userid in channel name as well
    this.supabase
      .channel(channelName)//for adding receiver id each pair-pair channel is different
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chats",
          filter: `or(receiver=eq.${receiverId},sender=eq.${senderId})`, // receive messages from or to receiver
        },
        (payload) => {
          this.listChat(receiverId);
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status, channelName);
      });
  }

  async listChat(receiverId: string) {
    try {
      const {
        data: { user },
      } = await this.getCurrentUser();
      const currentUserId = user?.id as string;
      this.receiverId.set(receiverId);
      const { data, error } = await this.supabase
        .from("chats")
        .select("*")
        .or(
          `and(sender.eq.${receiverId},receiver.eq.${currentUserId}),and(sender.eq.${currentUserId},receiver.eq.${receiverId})`
        )
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) {
        alert(error.message);
        return null;
      }
      this.allChats.set(data);
      if(receiverId&&currentUserId)
      this.subscribeToChats(receiverId,currentUserId);
      return data;
    } catch (error) {
      throw error;
    }
  }

  async listUser() {
    try {
      const {
        data: { user },
      } = await this.getCurrentUser();
      const currentUserId = user?.id;
      const { data, error } = await this.supabase
        .from("users")
        .select("*")
        .neq("id", currentUserId);
      if (error) {
        alert(error.message);
        return null;
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  selectedChats(msg: Ichat) {
    this.savedChat.set(msg);
  }

  editChatAction(action: string) {
    this.requestAction.set(action);
  }

  async deleteChat(id: string) {
    try {
      const { data, error } = await this.supabase
        .from("chats")
        .delete()
        .eq("id", id);
      if (error) {
        alert(error.message);
        return null;
      }
      return data;
    } catch (error) {
      throw error;
    }
  }

  async updateChatMessage(text: string) {
    try {
      const receiver: string = this.receiverId();
      let res;
      if(receiver){
        const { data, error } = await this.supabase
          .from("chats")
          .update({ text, receiver })
          .eq("id", this.savedChat().id);
        if (error) {
          alert(error.message);
          return null;
        }
        res = data;
      }
      return res;
    } catch (error) {
      throw error;
    }
  }
}
