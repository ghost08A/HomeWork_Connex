import { Component, inject } from '@angular/core';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'global-loading',
  standalone: true,
  template: `
    @if(loadingService.isLoading()) {
      <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity">
        <div class="bg-white px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center">
          <div class="w-14 h-14 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p class="text-gray-700 font-semibold text-lg animate-pulse">กำลังประมวลผล...</p>
        </div>
      </div>
    }
  `
})
export class GlobalLoadingComponent {
  public loadingService = inject(LoadingService);
}
