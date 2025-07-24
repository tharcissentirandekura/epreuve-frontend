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
    question: 'Mes informations personnelles sont-elles sécurisées ?',
    answer: 'Oui, nous prenons la sécurité des données très au sérieux. Toutes les informations personnelles sont cryptées et stockées en toute sécurité. Nous ne partageons jamais vos informations avec des tiers sans votre consentement explicite. Vous pouvez consulter notre Politique de confidentialité pour plus de détails.',
    category: 'À propos'
  },
  {
    id: 2,
    question: 'Comment puis-je contacter le support client ?',
    answer: 'Vous pouvez contacter notre équipe de support client par e-mail à support@company.com, via la fonction de chat sur notre site web, ou en appelant notre ligne d’assistance au +1 800 123 4567. Nos horaires d’assistance sont du lundi au vendredi, de 9 h à 18 h (EST).',
    category: 'Politique de confidentialité'
  },
  {
    id: 3,
    question: 'Quelles données collectez-vous et pourquoi ?',
    answer: 'Nous recueillons uniquement les données nécessaires pour fournir et améliorer nos services, telles que les informations de compte et les données d’utilisation. Cela nous aide à personnaliser votre expérience et à optimiser les performances du système. Vous trouverez tous les détails dans notre Politique de confidentialité.',
    category: 'À propos'
  },
  {
    id: 4,
    question: 'Puis-je supprimer définitivement mes données ?',
    answer: 'Oui, vous pouvez demander la suppression définitive de vos données à tout moment en contactant notre équipe en charge de la confidentialité à privacy@company.com. Une fois votre demande vérifiée, toutes vos informations personnelles seront supprimées de nos systèmes.',
    category: 'À propos'
  },
  {
    id: 5,
    question: 'Partagez-vous mes données avec des tiers ?',
    answer: 'Nous ne vendons ni ne louons vos données. Vos informations ne sont partagées avec des tiers que lorsqu’elles sont nécessaires à la fourniture de nos services, et toujours conformément à notre Politique de confidentialité.',
    category: 'À propos'
  },
  {
    id: 6,
    question: 'Puis-je mettre à jour ou corriger mes informations personnelles ?',
    answer: 'Oui, vous pouvez mettre à jour les informations de votre compte à tout moment depuis les paramètres de votre profil. Pour les corrections nécessitant une assistance, contactez notre équipe de support.',
    category: 'À propos'
  },
  {
    id: 7,
    question: 'Quelles mesures de sécurité sont en place pour protéger mes données ?',
    answer: 'Nous utilisons un chiffrement conforme aux normes de l’industrie, des serveurs sécurisés et des contrôles d’accès pour protéger vos données personnelles. Des audits réguliers et des évaluations de sécurité sont effectués pour garantir conformité et fiabilité.',
    category: 'À propos'
  },
  {
    id: 8,
    question: 'Que dois-je faire si je rencontre un problème technique ?',
    answer: 'Si vous rencontrez un problème technique, essayez de rafraîchir votre navigateur ou de redémarrer l’application. Si le problème persiste, contactez notre équipe de support en fournissant une description et des captures d’écran, si possible, afin que nous puissions vous aider rapidement.',
    category: 'Politique de confidentialité'
  },
  {
    id: 9,
    question: 'Proposez-vous un support le week-end ?',
    answer: 'Actuellement, notre équipe d’assistance est disponible du lundi au vendredi. Cependant, nous surveillons les problèmes urgents soumis via le portail d’assistance et faisons de notre mieux pour y répondre le plus rapidement possible.',
    category: 'Politique de confidentialité'
  },
  {
    id: 10,
    question: 'Combien de temps faut-il pour obtenir une réponse de votre équipe de support ?',
    answer: 'Notre délai de réponse moyen est de 24 h pendant les jours ouvrés. Pour les problèmes urgents, nous vous recommandons d’utiliser le chat en direct ou d’appeler notre ligne d’assistance pour recevoir une aide plus rapide.',
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