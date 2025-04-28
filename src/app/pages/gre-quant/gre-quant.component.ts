import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-gre-quant',
  imports: [CommonModule],
  templateUrl: './gre-quant.component.html',
  styleUrl: './gre-quant.component.scss'
})
export class GreQuantComponent {
  videoUrl: string | ArrayBuffer | null = null;
  title: string | null = 'Mental Math GRE Estimation';
  categories = [
    {
      title: 'General Mental Strategies',
      videos: [
        { title: 'Mental Math GRE Estimation', path: '/assets/videos/2.MentalMathGREEstimation-MagooshGRE.webm' },
        { title: 'Quick Multiplication', path: 'videos/mental_math/quick_multiplication.webm' }
      ]
    },
    {
      title: 'Probability',
      videos: [
        { title: 'Introduction to Probability', path: 'videos/probability/intro_probability.webm' },
        { title: 'Advanced Probability', path: 'videos/probability/advanced_probability.webm' }
      ]
    }
    // ➡️ Add more categories and videos here
  ];

  ngOnInit(): void {
    // Load first video by default (optional)
    if (this.categories.length && this.categories[0].videos.length) {
      this.videoUrl = this.categories[0].videos[0].path;
    }
  }

  selectVideo(video: any) {
    this.title = video?.title;
    this.videoUrl = video?.path;
  }
}
