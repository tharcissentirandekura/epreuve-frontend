import { FaqService } from '../services/faq/faq.service';
import { FAQ } from './faq';

describe('Faq', () => {
  it('should create an instance', () => {
    expect(new FaqService()).toBeTruthy();
  });
});
