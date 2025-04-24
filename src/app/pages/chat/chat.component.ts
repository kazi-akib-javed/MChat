import {
  Component,
  computed,
  effect,
  HostListener,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ChatService } from '../../supabase/chat.service';
import { Ichat } from '../../interface/chat-response';
import { ModalsComponent } from '../../layout/modals/modals.component';
import { Action } from '../../enum/action';
import { UserComponent } from '../friend/user/user.component';
import { IUser } from '../../interface/user-response';

@Component({
  selector: 'app-chat',
  imports: [ReactiveFormsModule, UserComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private chat_service = inject(ChatService);
  modalTitle: string = '';
  modalMessage: string = '';
  chats = signal<Ichat[]>([]);
  chatForm!: FormGroup;
  editChat: string = '';
  isEditChat: boolean = false;
  isSelectedChat: boolean = false;
  receiverId: string = '';

  @ViewChild(ModalsComponent) modals!: ModalsComponent;
  constructor() {
    this.chatForm = this.fb.group({
      chat_message: ['', Validators.required],
    });
    effect(() => {
      this.receiverId = this.chat_service.receiverId();
      const latestChats = this.chat_service.allChats();
      this.chats.set(latestChats);
      this.isSelectedChat = this.chat_service.selectedChat();
    });
  }

  async logOut() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }

  async onSubmit() {
    const formValue = this.chatForm.value.chat_message?.trim();
    if (!formValue || !this.receiverId) return;

    try {
      if (this.isEditChat) {
        await this.chat_service.updateChatMessage(formValue);
        this.isEditChat = false; // Reset editing state
      } else {
        await this.chat_service.sendMessage(formValue);
      }

      this.chatForm.reset();
      this.onListChat(); // Refresh chat list after operation
    } catch (error) {
      console.error('Chat submission failed:', error);
      // Optionally show a toast or alert
    }
  }

  onBack(){
    this.chat_service.selectedChat.set(false);
  }

  onListChat () {
    const chats = this.chat_service.allChats();
    if (chats) this.chats.set(chats);
  }

  openModal(title: string, message: string) {
    this.modals.openModal(title, message);
  }

  selectedChat(msg: Ichat) {
    this.chat_service.selectedChats(msg);
    this.editChat = msg.text;
  }

  editMessage() {
    this.chatForm.patchValue({
      chat_message: this.chat_service.savedChat().text,
    });
    this.isEditChat = true;
  }

  deleteChatAction() {
    this.chat_service.requestAction.set(Action.DELETE);
  }
}
