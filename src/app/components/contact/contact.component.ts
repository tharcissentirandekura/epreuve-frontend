import { Component } from '@angular/core';
import { FooterComponent } from '../../reusable/footer/footer.component';
import { NavbarComponent } from '../../reusable/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { EmailServiceService } from '../../services/contact/email-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FooterComponent, NavbarComponent, FormsModule, CommonModule],
  providers: [EmailServiceService],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {

  formData = {
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  };
  
  isSubmitting = false;
  popupMessage: string | null = null;
  popupSuccess = false;
  
  constructor(private emailService: EmailServiceService) {}
  
  async onSubmit() {
    if (this.isSubmitting) return;
  
    this.isSubmitting = true;
  
    try {
      await this.emailService.sendEmail(this.formData);
      this.popupSuccess = true;
      this.popupMessage = 'The message was successfully sent!';
  
      this.formData = {
        firstName: '',
        lastName: '',
        email: '',
        message: ''
      };
    } catch (error) {
      this.popupSuccess = false;
      this.popupMessage = 'The message failed. Try again.';
    } finally {
      this.isSubmitting = false;
      setTimeout(() => this.popupMessage = null, 3000);
    }
  }  

  }
