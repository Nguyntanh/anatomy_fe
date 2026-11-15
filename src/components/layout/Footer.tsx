import { AlertCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="h-9 shrink-0 bg-white border-t border-slate-200 px-4 lg:px-6 flex items-center justify-between gap-4 text-[11px] text-slate-500 z-20">
      <div className="flex items-center gap-1.5 min-w-0">
        <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <p className="truncate">
          <span className="font-medium text-slate-600">Disclaimer:</span> Thông
          tin chỉ mang tính tham khảo, không thay thế chẩn đoán y khoa chuyên
          nghiệp.
        </p>
      </div>
      <div className="hidden md:flex items-center gap-2 shrink-0 text-slate-400">
        <span>Nguồn trích dẫn:</span>
        <a
          href="https://www.who.int/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-sky-600 transition-colors"
        >
          WHO
        </a>
        <span aria-hidden="true">·</span>
        <a
          href="https://moh.gov.vn/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-sky-600 transition-colors"
        >
          Bộ Y tế
        </a>
        <span aria-hidden="true">·</span>
        <a
          href="https://www.vinmec.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-sky-600 transition-colors"
        >
          Vinmec
        </a>
      </div>
    </footer>
  );
}
