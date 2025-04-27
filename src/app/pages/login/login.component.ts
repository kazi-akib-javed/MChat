import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../env/env.dev';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  constructor(){}
  private auth = inject(AuthService);
  async handleAuth() {
    const response = await this.auth.signInWithGoolge();
  }
}
