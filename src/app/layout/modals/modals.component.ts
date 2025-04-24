import {
  AfterViewInit,
  Component,
  HostListener,
  inject,
  OnDestroy
} from '@angular/core';
import { ChatService } from '../../supabase/chat.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modals',
  standalone: true,
  imports: [],
  templateUrl: './modals.component.html',
  styleUrl: './modals.component.scss',
})
export class ModalsComponent implements AfterViewInit, OnDestroy {
  modalTitle = '';
  modalMessage = '';

  private modalInstance: any;
  private chat_service = inject(ChatService);
  private router = inject(Router);

  ngAfterViewInit() {
    this.initializeModal();
  }

  ngOnDestroy() {
    // Clean up modal instance on component destruction
    if (this.modalInstance) {
      this.modalInstance.dispose(); // Ensures modal is disposed when component is destroyed
    }
  }

  private initializeModal() {
    const modalElement = document.getElementById('exampleModal');
    if (modalElement) {
      this.modalInstance = new (window as any).bootstrap.Modal(modalElement);
    }
  }

  openModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;

    if (this.modalInstance) {
      this.modalInstance.show();
    }
  }

  deleteChat() {
    const id = this.chat_service.savedChat()?.id;
    this.chat_service
      .deleteChat(id)
      .then((res) => {
        console.log(res);
        this.closeModal();
        // Auto reload the page after deletion
        let currentUrl = this.router.url;
        this.router
          .navigateByUrl('/', { skipLocationChange: true })
          .then(() => {
            this.router.navigate([currentUrl]);
          });
      })
      .catch((err: any) => {
        alert(err.message);
      });
  }

  closeModal() {
    if (this.modalInstance) {
      this.modalInstance.hide();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent) {
    if (this.modalInstance) {
      this.modalInstance.hide(); // Close the modal when Escape is pressed
    }
  }
}
