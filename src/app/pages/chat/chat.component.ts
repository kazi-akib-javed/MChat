import { Injectable, signal } from "@angular/core";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { environment } from "../../../env/env.dev";
import { Ichat } from "../../interface/chat-response";



@Injectable({ providedIn: "root" })
export class ChatComponent {
  private supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  public savedChat = signal<Ichat>({} as Ichat);
  public allChats = signal<Ichat[]>([]);
  public requestAction = signal<string>("");
  public receiverId = signal<string>("");
  public selectedChat = signal<boolean>(false);

  async getCurrentUser() {
    const { data } = await this.supabase.auth.getUser();
    return data?.user;
  }

  async sendMessage(text: string) {
    try {
      const receiver = this.receiverId();
      const { error } = await this.supabase
        .from("chats")
        .insert({ text, receiver }); // sender is auto-filled via RLS
      if (error) throw error;
    } catch (err: any) {
      alert(err.message || err);
    }
  }

  private getChannelName(user1: string, user2: string) {
    const sorted = [user1, user2].sort();
    return `chat-room-${sorted[0]}-${sorted[1]}`;
  }

  subscribeToChats(receiverId: string, senderId: string) {
    const channelName = this.getChannelName(receiverId, senderId);

    this.supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chats",
          filter: `or(sender=eq.${senderId},receiver=eq.${senderId})`,
        },
        () => {
          this.listChat(receiverId); // fetch updated list on insert
        }
      )
      .subscribe((status) => {
        console.log("Subscription:", status, "on", channelName);
      });
  }

  async listChat(receiverId: string) {
    try {
      const user = await this.getCurrentUser();
      const currentUserId = user?.id as string;
      this.receiverId.set(receiverId);

      const { data, error } = await this.supabase
        .from("chats")
        .select("*")
        .or(
          `and(sender.eq.${receiverId},receiver.eq.${currentUserId}),and(sender.eq.${currentUserId},receiver.eq.${receiverId})`
        )
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      this.allChats.set(data);
      this.subscribeToChats(receiverId, currentUserId);
    } catch (error) {
      console.error("List chat error:", error);
    }
  }

  async listUser() {
    try {
      const user = await this.getCurrentUser();
      const currentUserId = user?.id;
      const { data, error } = await this.supabase
        .from("users")
        .select("*")
        .neq("id", currentUserId);
      if (error) throw error;
      return data;
    } catch (err) {
      alert(err);
      return [];
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
      const { error } = await this.supabase
        .from("chats")
        .delete()
        .eq("id", id);
      if (error) throw error;
    } catch (error) {
      alert(error);
    }
  }

  async updateChatMessage(text: string) {
    try {
      const id = this.savedChat().id;
      const receiver = this.receiverId();
      const { error } = await this.supabase
        .from("chats")
        .update({ text, receiver })
        .eq("id", id);
      if (error) throw error;
    } catch (err) {
      alert(err);
    }
  }
}
