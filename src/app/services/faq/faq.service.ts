import { Injectable } from '@angular/core';
import { FAQ } from '../../models/faq';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private faqs: FAQ[] = [
      {
        id: 1,
        question: 'Is my personal information secure?',
        answer: 'Yes, we take data security very seriously. All personal information is encrypted and stored securely. We never share your information with third parties without your explicit consent. You can read our Privacy Policy for more details.',
        category: 'À propos'
      },
      {
        id: 2,
        question: 'How can I contact customer support?',
        answer: 'You can contact our customer support team via email at support@company.com, through the chat function on our website, or by calling our support line at +1-800-123-4567. Our support hours are Monday to Friday, 9 AM to 6 PM EST.',
        category: 'Politique de confidentialité'
      },
      {
        id: 3,
        question: 'What data do you collect and why?',
        answer: 'We collect only the data necessary to provide and improve our services, such as account details and usage data. This helps us personalize your experience and enhance system performance. Full details can be found in our Privacy Policy.',
        category: 'À propos'
      },
      {
        id: 4,
        question: 'Can I delete my data permanently?',
        answer: 'Yes, you can request permanent deletion of your data at any time by contacting our privacy team at privacy@company.com. Once verified, all your personal information will be removed from our systems.',
        category: 'À propos'
      },
      {
        id: 5,
        question: 'Do you share my data with third parties?',
        answer: 'We do not sell or rent your data. Your information is shared with third parties only when necessary to provide our services, and always in compliance with our Privacy Policy.',
        category: 'À propos'
      },
      {
        id: 6,
        question: 'Can I update or correct my personal information?',
        answer: 'Yes, you can update your account information at any time from your profile settings. For corrections that require assistance, contact our support team for help.',
        category: 'À propos'
      },
      {
        id: 7,
        question: 'What security measures are in place to protect my data?',
        answer: 'We use industry-standard encryption, secure servers, and access controls to safeguard your personal data. Regular audits and security assessments are conducted to maintain compliance and safety.',
        category: 'À propos'
      },
      {
        id: 8,
        question: 'What should I do if I encounter a technical issue?',
        answer: 'If you experience a technical issue, try refreshing your browser or restarting the app. If the issue persists, contact our support team with a description and screenshots, if possible, so we can assist you promptly.',
        category: 'Politique de confidentialité'
      },
      {
        id: 9,
        question: 'Do you offer support on weekends?',
        answer: 'Currently, our support team is available Monday through Friday. However, we monitor urgent issues submitted through the support portal and aim to address them as quickly as possible.',
        category: 'Politique de confidentialité'
      },
      {
        id: 10,
        question: 'How long does it take to get a response from support?',
        answer: 'Our average response time is within 24 hours during business days. For urgent issues, we recommend using the live chat feature or calling our support line for faster assistance.',
        category: 'Politique de confidentialité'
      }
  ];

  constructor() { }

  getAllFaqs(): Observable<FAQ[]> {
    return of(this.faqs);
  }

  getFaqsByCategory(category: string): Observable<FAQ[]> {
    return of(this.faqs.filter(faq => faq.category === category));
  }

  getCategories(): Observable<string[]> {
    const categories = [...new Set(this.faqs.map(faq => faq.category))];
    return of(categories);
  }

  searchFaqs(term: string): Observable<FAQ[]> {
    if (!term.trim()) {
      return this.getAllFaqs();
    }
    const searchTerm = term.toLowerCase();
    return of(this.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm) || 
      faq.answer.toLowerCase().includes(searchTerm)
    ));
  }
}