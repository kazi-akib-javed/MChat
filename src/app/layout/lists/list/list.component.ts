import { Component, inject, signal } from '@angular/core';
import { ChatService } from '../../../supabase/chat.service';
import { IUser } from '../../../interface/user-response';

@Component({
  selector: 'app-list',
  imports: [],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
  users = signal<IUser[]>([]);
  private chat_service = inject(ChatService);
  onListUser() {
    this.chat_service.listUser().then((res) => {
      this.users.set(res as IUser[]);
    }).catch((err: any)=>{
      alert(err.message);
    });
  }
}
