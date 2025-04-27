import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { barronWords } from "../../json/barrons-words";

@Component({
  selector: "app-barron",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./barron.component.html",
  styleUrls: ["./barron.component.scss"],
})
export class BarronComponent implements OnInit {
  words: any[] = barronWords;
  paginatedWords: any[] = [];
  currentPage: number = 1;
  wordsPerPage: number = 10;
  
  ngOnInit(): void {
    this.paginatedWords = this.words.slice(0,10); 
  }
  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.wordsPerPage;
    const endIndex = startIndex + this.wordsPerPage;
    this.paginatedWords = this.words.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < Math.ceil(this.words.length / this.wordsPerPage)) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
}
