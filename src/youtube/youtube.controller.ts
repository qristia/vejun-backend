import { Controller, Get, Query } from '@nestjs/common';
import { Public } from 'src/util/public_metadata';
import { YoutubeService } from './youtube.service';
import { YoutubeSearchResult } from './dto/videos-response.dto';

@Controller('youtube')
export class YoutubeController {
  constructor(private youtubeService: YoutubeService) {}
  @Get()
  async getVid(@Query('vid') vid: string) {
    return this.youtubeService.getVid(vid);
  }

  @Get('search')
  async searchVideo(@Query('q') query: string): Promise<YoutubeSearchResult> {
    return await this.youtubeService.searchVideo(query);
  }
}
