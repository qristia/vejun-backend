import { Controller, Get, Query } from '@nestjs/common';
import { Public } from 'src/util/public_metadata';
import { YoutubeService } from './youtube.service';

@Controller('youtube')
export class YoutubeController {
  constructor(private youtubeService: YoutubeService) {}
  @Get()
  @Public()
  async getVid(@Query('vid') vid: string) {
    return this.youtubeService.getVid(vid);
  }
}
