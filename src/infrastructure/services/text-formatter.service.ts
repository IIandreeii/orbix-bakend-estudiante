import { Injectable } from '@nestjs/common';
import TurndownService from 'turndown';

@Injectable()
export class TextFormatterService {
  private readonly turndownService: TurndownService;

  constructor() {
    this.turndownService = new TurndownService();

    this.turndownService.addRule('br', {
      filter: 'br',
      replacement: () => '\n',
    });

    this.turndownService.addRule('strong', {
      filter: ['strong', 'b'],
      replacement: (content: string) => `*${content}*`,
    });
  }

  public htmlToMarkdown(html: string): string {
    if (!html) return '';
    return this.turndownService.turndown(html);
  }
}
