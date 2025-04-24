import { Component, effect, EventEmitter, inject, Inject, Output, signal } from '@angular/core';
import { ChatService } from '../../../supabase/chat.service';
import { IUser } from '../../../interface/user-response';

@Component({
  selector: 'app-user',
  imports: [],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent {
  private chat_service = inject(ChatService);
  public users = signal<IUser[]>([]);
  constructor() {
    effect(()=>{
      this.onListUser();
    });
  }

  onLoadChat(receiverId: string){
    this.chat_service.listChat(receiverId);
    this.chat_service.selectedChat.set(true);
  }

  onListUser() {
    this.chat_service.listUser().then((res) => {
      this.users.set(res as IUser[]);
    }).catch((err: any)=>{
      alert(err.message);
    });
  }
}
