import { Injectable } from '@angular/core';
import emailjs from 'emailjs-com';

@Injectable({
  providedIn: 'root'
})

export class EmailServiceService {

  private readonly SERVICE_ID = 'service_8oqmvqk';
  private readonly TEMPLATE_ID = 'template_b7huwvf';
  private readonly AUTO_RESPONSE_TEMPLATE_ID = 'template_h4o9nkj';
  private readonly PUBLIC_KEY = 'iaa1bXnaA4p_bzvfQ';

  constructor() { 
    emailjs.init(this.PUBLIC_KEY);
  }

  async sendEmail(formData: any): Promise<void> {
    try {
      const templateParams = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        message: formData.message,
        to_email: 'yvandarcyi@gmail.com'
      };

      await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams
      );
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendAutoResponse(formData: any): Promise<void> {
    try {
      const templateParams = {
        firstname: formData.firstname,
        to_email: formData.email
      };

      await emailjs.send(
        this.SERVICE_ID,
        this.AUTO_RESPONSE_TEMPLATE_ID,
        templateParams
      );
    } catch (error) {
      console.error('Error sending auto-response email:', error);
      throw error;
    }
  }
}