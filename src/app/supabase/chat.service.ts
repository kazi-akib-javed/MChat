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
  private currentChannel: string | null = null;

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
        .insert({ text, receiver }); // sender is handled via Supabase policy
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

      // Only subscribe once
      if (receiverId && currentUserId) {
        this.subscribeToChats(receiverId, currentUserId);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  subscribeToChats(receiverId: string, senderId: string) {
    const sortedIds = [receiverId, senderId].sort();
    const channelName = `chat-room-${sortedIds[0]}-${sortedIds[1]}`;

    // Avoid duplicate subscriptions
    if (this.currentChannel === channelName) return;
    this.currentChannel = channelName;

    this.supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chats",
        },
        async (payload) => {
          const message = payload.new;
          const relevant =
            (message['sender'] === senderId && message['receiver'] === receiverId) ||
            (message['sender'] === receiverId && message['receiver'] === senderId);
          if (relevant) {
            await this.listChat(receiverId); // auto-refresh
          }
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status, channelName);
      });
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
      if (receiver) {
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
