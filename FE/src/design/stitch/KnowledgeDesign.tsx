// Converted from kho_ki_n_th_c_ai_smartphone_ai_admin/code.html. Read-only design reference.
// Inline scripts were replaced by React state in src/pages and src/features.
export default function KnowledgeDesign() {
  return (
    <div className="bg-background font-body-md text-body-md text-on-surface antialiased">
      <aside className={"fixed left-0 top-0 h-full w-[260px] bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between pt-6 pb-6"}>
        <div className={"flex flex-col"}>
          <div className={"px-6 mb-8 flex items-center justify-between"}>
            <div className={"flex items-center gap-2.5"}>
              <div className={"w-9 h-9 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary"}>
                <span className={"material-symbols-outlined text-[20px]"}>
{"auto_awesome"}
                </span>
              </div>
              <div className={"flex flex-col"}>
                <span className={"font-headline-sm text-label-md text-on-surface font-semibold tracking-tight"}>
{"SmartPhone AI"}
                </span>
                <span className={"font-caption text-caption text-secondary font-medium tracking-wide"}>
{"ADMIN PORTAL"}
                </span>
              </div>
            </div>
          </div>
          <nav className={"px-3 flex flex-col gap-1"}>
            <a className={"flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"} data-path={"tong-quan"} href={"#"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"dashboard"}
              </span>
              <span>
{"Tổng quan"}
              </span>
            </a>
            <a className={"flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"} data-path={"quan-ly-san-pham"} href={"#"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"smartphone"}
              </span>
              <span>
{"Quản lý sản phẩm"}
              </span>
            </a>
            <a className={"flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"} data-path={"quan-ly-don-hang"} href={"#"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"receipt_long"}
              </span>
              <span>
{"Quản lý đơn hàng"}
              </span>
            </a>
            <a aria-current={"page"} className={"flex items-center gap-3 px-3.5 py-2.5 transition-all bg-primary text-on-primary font-medium rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)]"} data-path={"kho-kien-thuc-ai"} href={"#"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"dataset"}
              </span>
              <span>
{"Kho kiến thức AI"}
              </span>
            </a>
            <a className={"flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"} data-path={"cau-hinh-ai"} href={"#"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"tune"}
              </span>
              <span>
{"Cấu hình AI"}
              </span>
            </a>
          </nav>
        </div>
        <div className={"px-3 flex flex-col gap-3"}>
          <a className={"flex items-center justify-between px-3.5 py-2.5 rounded-lg font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"} href={"/"}>
{"Quay lại cửa hàng"}
          </a>
          <div className={"p-3 bg-surface-container-low rounded-xl flex items-center gap-3"}>
            <div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0"}>
              <span className={"material-symbols-outlined text-on-primary text-[18px]"}>
{"person"}
              </span>
            </div>
            <div className={"flex flex-col min-w-0 flex-1"}>
              <span className={"font-label-sm text-label-sm text-on-surface font-medium truncate"}>
{"Quản trị viên"}
              </span>
              <span className={"font-caption text-caption text-on-surface-variant truncate"}>
{"Super Admin"}
              </span>
            </div>
          </div>
        </div>
      </aside>
      <div className={"pl-[260px]"}>
        <header className={"fixed top-0 left-[260px] right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-8 flex items-center justify-between"}>
          <div className={"flex items-center gap-2"}>
            <span className={"font-label-sm text-label-sm text-on-surface-variant"}>
{"SmartPhone AI"}
            </span>
            <span className={"font-caption text-caption text-outline"}>
{"/"}
            </span>
            <span className={"font-label-sm text-label-sm text-on-surface font-medium"}>
{"Bảng điều khiển"}
            </span>
          </div>
          <div className={"flex items-center gap-5"}>
            <div className={"hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low"}>
              <span className={"w-2 h-2 rounded-full bg-primary-container animate-pulse"}>

              </span>
              <span className={"font-label-sm text-label-sm text-on-surface-variant"}>
{"Hệ thống AI: Hoạt động"}
              </span>
            </div>
            <div className={"hidden md:flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant"}>
              <span className={"material-symbols-outlined text-[16px]"}>
{"schedule"}
              </span>
              <span>
{"Hôm nay"}
              </span>
            </div>
            <button className={"w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"} type={"button"}>
              <span className={"material-symbols-outlined text-[20px]"}>
{"notifications"}
              </span>
            </button>
            <div className={"w-8 h-8 rounded-full bg-primary flex items-center justify-center"}>
              <span className={"material-symbols-outlined text-on-primary text-[18px]"}>
{"person"}
              </span>
            </div>
          </div>
        </header>
        <main className={"w-full pt-16 bg-background min-h-screen"}>
          <div className={"flex flex-col w-full"}>
            <div className={"max-w-[1280px] w-full mx-auto px-6 py-8 flex flex-col gap-8"}>
              <div className={"flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2"}>
                <div className={"flex flex-col"}>
                  <div className={"flex items-center gap-2 mb-1"}>
                    <span className={"font-headline-md text-headline-md text-on-surface font-semibold tracking-tight"}>
{"Kho kiến thức AI (RAG Documents)"}
                    </span>
                    <span className={"px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-caption text-caption uppercase tracking-wider font-semibold"}>
{"Vector DB Active"}
                    </span>
                  </div>
                  <p className={"font-body-md text-body-md text-on-surface-variant max-w-2xl"}>
{" Quản lý tài liệu chính sách cửa hàng và cẩm nang kỹ thuật dùng để truy xuất ngữ cảnh chính xác cho Trợ lý AI. "}
                  </p>
                </div>
                <div className={"flex items-center gap-3 shrink-0"}>
                  <button className={"inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm"} type={"button"}>
                    <span className={"material-symbols-outlined text-[18px]"}>
{"sync"}
                    </span>
                    <span>
{"Đồng bộ Index"}
                    </span>
                  </button>
                  <button className={"inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md hover:opacity-95 transition-all shadow-[0_2px_8px_rgba(0,102,204,0.2)]"} type={"button"}>
                    <span className={"material-symbols-outlined text-[20px]"}>
{"add"}
                    </span>
                    <span>
{"Tải tài liệu lên"}
                    </span>
                  </button>
                </div>
              </div>
              <div className={"grid grid-cols-1 md:grid-cols-3 gap-5"}>
                <div className={"bg-surface-container-lowest rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden group"}>
                  <div className={"absolute -right-4 -bottom-4 w-28 h-28 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"}>

                  </div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span className={"font-label-md text-label-md text-on-surface-variant font-medium"}>
{"Tổng số chunks văn bản"}
                    </span>
                    <div className={"w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"splitscreen"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className={"flex items-baseline gap-2"}>
                      <span className={"font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight"}>
{"1,420"}
                      </span>
                      <span className={"font-label-sm text-label-sm text-primary font-medium"}>
{"chunks"}
                      </span>
                    </div>
                    <div className={"flex items-center gap-1.5 mt-2"}>
                      <span className={"material-symbols-outlined text-[16px] text-primary"}>
{"auto_awesome"}
                      </span>
                      <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"Phân bố qua 18 nguồn tài liệu"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={"bg-surface-container-lowest rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden group"}>
                  <div className={"absolute -right-4 -bottom-4 w-28 h-28 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors"}>

                  </div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span className={"font-label-md text-label-md text-on-surface-variant font-medium"}>
{"Độ trễ phản hồi RAG trung bình"}
                    </span>
                    <div className={"w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"speed"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className={"flex items-baseline gap-2"}>
                      <span className={"font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight"}>
{"180"}
                      </span>
                      <span className={"font-label-sm text-label-sm text-secondary font-medium"}>
{"ms"}
                      </span>
                    </div>
                    <div className={"flex items-center gap-1.5 mt-2"}>
                      <span className={"material-symbols-outlined text-[16px] text-secondary"}>
{"bolt"}
                      </span>
                      <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"Truy xuất ngữ cảnh nội tại siêu tốc"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={"bg-surface-container-lowest rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden group"}>
                  <div className={"absolute -right-4 -bottom-4 w-28 h-28 bg-primary-container/5 rounded-full blur-2xl group-hover:bg-primary-container/10 transition-colors"}>

                  </div>
                  <div className={"flex items-center justify-between mb-4"}>
                    <span className={"font-label-md text-label-md text-on-surface-variant font-medium"}>
{"Tỉ lệ trích dẫn chính xác"}
                    </span>
                    <div className={"w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary-container"}>
                      <span className={"material-symbols-outlined text-[20px]"}>
{"verified"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className={"flex items-baseline gap-2"}>
                      <span className={"font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight"}>
{"98.4%"}
                      </span>
                      <span className={"font-label-sm text-label-sm text-on-surface-variant font-medium"}>
{"căn cứ thực tế"}
                      </span>
                    </div>
                    <div className={"flex items-center gap-1.5 mt-2"}>
                      <span className={"material-symbols-outlined text-[16px] text-primary-container"}>
{"verified_user"}
                      </span>
                      <span className={"font-body-sm text-body-sm text-on-surface-variant"}>
{"Hạn chế tối đa ảo giác (Hallucination)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={"bg-surface-container-lowest rounded-2xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center text-center relative cursor-pointer hover:bg-surface-container-low/70 transition-all group overflow-hidden"} id={"drop-zone"}>
                <input accept={".pdf,.txt"} className={"hidden"} id={"file-upload-input"} multiple={true} type={"file"} />
                <div className={"absolute inset-0 bg-gradient-to-b from-secondary-fixed/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"}>

                </div>
                <div className={"relative z-10 flex flex-col items-center max-w-xl"}>
                  <div className={"w-16 h-16 rounded-2xl bg-secondary-fixed flex items-center justify-center text-secondary mb-4 group-hover:scale-105 transition-transform"}>
                    <div className={"relative"}>
                      <span className={"material-symbols-outlined text-[32px]"}>
{"cloud_upload"}
                      </span>
                      <span className={"material-symbols-outlined text-[16px] text-secondary-container absolute -top-1 -right-2 animate-bounce"}>
{"auto_awesome"}
                      </span>
                    </div>
                  </div>
                  <h3 className={"font-headline-sm text-headline-sm text-on-surface font-semibold mb-1"}>
{" Kéo thả file tài liệu vào đây hoặc "}
                    <span className={"text-primary-container underline underline-offset-4 font-semibold"}>
{"Nhấn để duyệt file"}
                    </span>
                  </h3>
                  <p className={"font-body-sm text-body-sm text-on-surface-variant mt-1.5"}>
{" Hỗ trợ định dạng PDF, TXT (Tối đa 25MB). Hệ thống sẽ tự động phân tích và tạo Vector Embedding phục vụ RAG. "}
                  </p>
                  <div className={"flex items-center gap-6 mt-5 text-on-surface-variant font-label-sm text-label-sm"}>
                    <div className={"flex items-center gap-1.5"}>
                      <span className={"material-symbols-outlined text-[16px] text-secondary"}>
{"memory"}
                      </span>
                      <span>
{"Tự động phân tách Chunks"}
                      </span>
                    </div>
                    <div className={"w-1 h-1 rounded-full bg-outline-variant"}>

                    </div>
                    <div className={"flex items-center gap-1.5"}>
                      <span className={"material-symbols-outlined text-[16px] text-primary"}>
{"lock"}
                      </span>
                      <span>
{"Bảo mật dữ liệu nội bộ"}
                      </span>
                    </div>
                    <div className={"w-1 h-1 rounded-full bg-outline-variant"}>

                    </div>
                    <div className={"flex items-center gap-1.5"}>
                      <span className={"material-symbols-outlined text-[16px] text-primary-container"}>
{"layers"}
                      </span>
                      <span>
{"Cosine Similarity Search"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={"bg-surface-container-low rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"}>
                <div className={"flex items-center gap-3.5 min-w-0"}>
                  <div className={"w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary shrink-0"}>
                    <span className={"material-symbols-outlined text-[22px] animate-spin"}>
{"sync"}
                    </span>
                  </div>
                  <div className={"flex flex-col min-w-0"}>
                    <div className={"flex items-center gap-2 flex-wrap"}>
                      <span className={"font-label-md text-label-md text-on-surface font-semibold truncate"}>
{"Đang xử lý tài liệu: Cam-nang-iPhone-16-Series.pdf"}
                      </span>
                      <span className={"px-2 py-0.5 rounded-md bg-secondary-container text-on-secondary font-caption text-caption font-medium"}>
{"Bóc tách & Tạo Vector Embedding"}
                      </span>
                    </div>
                    <span className={"font-body-sm text-body-sm text-on-surface-variant truncate mt-0.5"}>
{"Tiến trình phân tách 142 trang tài liệu sang 480 chunks vector hóa (68%)..."}
                    </span>
                  </div>
                </div>
                <div className={"flex items-center gap-4 shrink-0 sm:w-64 flex-col sm:flex-row"}>
                  <div className={"w-full bg-surface-container-highest h-2 rounded-full overflow-hidden"}>
                    <div className={"bg-secondary h-full rounded-full transition-all duration-500"} style={{"width":"68%"}}>

                    </div>
                  </div>
                  <span className={"font-label-sm text-label-sm text-secondary font-semibold shrink-0"}>
{"68%"}
                  </span>
                </div>
              </div>
              <div className={"bg-surface-container-lowest rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col"}>
                <div className={"p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low/40"}>
                  <div className={"flex items-center gap-3 flex-1 max-w-md"}>
                    <div className={"relative w-full"}>
                      <span className={"material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]"}>
{"search"}
                      </span>
                      <input className={"w-full pl-10 pr-4 py-2 bg-surface-container-lowest rounded-xl font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none shadow-sm"} placeholder={"Tìm tài liệu hoặc mục đích RAG..."} type={"text"} />
                    </div>
                  </div>
                  <div className={"flex items-center gap-2.5"}>
                    <div className={"flex items-center gap-1.5 px-3 py-2 bg-surface-container-lowest rounded-xl shadow-sm text-on-surface-variant font-label-sm text-label-sm"}>
                      <span className={"material-symbols-outlined text-[18px]"}>
{"filter_list"}
                      </span>
                      <span>
{"Tất cả mục đích"}
                      </span>
                    </div>
                    <div className={"flex items-center gap-1.5 px-3 py-2 bg-surface-container-lowest rounded-xl shadow-sm text-on-surface-variant font-label-sm text-label-sm"}>
                      <span className={"material-symbols-outlined text-[18px]"}>
{"tune"}
                      </span>
                      <span>
{"Trạng thái: Tất cả"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={"overflow-x-auto w-full"}>
                  <table className={"w-full text-left border-collapse"}>
                    <thead>
                      <tr className={"bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider"}>
                        <th className={"py-3.5 px-6 font-semibold"}>
{"Tên tài liệu"}
                        </th>
                        <th className={"py-3.5 px-4 font-semibold"}>
{"Định dạng & Dung lượng"}
                        </th>
                        <th className={"py-3.5 px-4 font-semibold"}>
{"Mục đích RAG"}
                        </th>
                        <th className={"py-3.5 px-4 font-semibold"}>
{"Ngày tải lên"}
                        </th>
                        <th className={"py-3.5 px-4 font-semibold"}>
{"Trạng thái xử lý"}
                        </th>
                        <th className={"py-3.5 px-6 font-semibold text-right"}>
{"Thao tác"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className={"divide-y divide-surface-container text-on-surface font-body-sm text-body-sm"}>
                      <tr className={"hover:bg-surface-container-low/40 transition-colors"}>
                        <td className={"py-4 px-6"}>
                          <div className={"flex items-center gap-3"}>
                            <div className={"w-9 h-9 rounded-lg bg-error-container text-error flex items-center justify-center shrink-0"}>
                              <span className={"material-symbols-outlined text-[20px]"}>
{"picture_as_pdf"}
                              </span>
                            </div>
                            <div className={"flex flex-col min-w-0"}>
                              <span className={"font-label-md text-label-md text-on-surface font-medium truncate"}>
{"Chinh-sach-bao-hanh-12-thang.pdf"}
                              </span>
                              <span className={"font-caption text-caption text-on-surface-variant"}>
{"142 chunks • Cập nhật tự động"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className={"py-4 px-4 whitespace-nowrap text-on-surface-variant"}>
                          <span className={"font-medium text-on-surface"}>
{"PDF"}
                          </span>
{" • 1.8 MB "}
                        </td>
                        <td className={"py-4 px-4"}>
                          <span className={"px-2.5 py-1 rounded-lg bg-surface-container font-label-sm text-label-sm text-on-surface-variant inline-flex items-center gap-1.5"}>
                            <span className={"w-1.5 h-1.5 rounded-full bg-primary"}>

                            </span>
{" Hỗ trợ cửa hàng RAG "}
                          </span>
                        </td>
                        <td className={"py-4 px-4 whitespace-nowrap text-on-surface-variant"}>
{" 20/10/2025 "}
                        </td>
                        <td className={"py-4 px-4 whitespace-nowrap"}>
                          <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface font-medium"}>
                            <span className={"w-2 h-2 rounded-full bg-primary-container"}>

                            </span>
{" Sẵn sàng (READY) "}
                          </span>
                        </td>
                        <td className={"py-4 px-6 text-right whitespace-nowrap"}>
                          <div className={"inline-flex items-center gap-1"}>
                            <button className={"p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"} title={"Xem chi tiết chunks"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"segment"}
                              </span>
                            </button>
                            <button className={"p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"} title={"Xử lý lại"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"replay"}
                              </span>
                            </button>
                            <button className={"p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"} title={"Vô hiệu hóa"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"toggle_on"}
                              </span>
                            </button>
                            <button className={"p-1.5 rounded-lg text-error hover:bg-error-container/40 transition-colors"} title={"Xóa"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"delete"}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr className={"hover:bg-surface-container-low/40 transition-colors"}>
                        <td className={"py-4 px-6"}>
                          <div className={"flex items-center gap-3"}>
                            <div className={"w-9 h-9 rounded-lg bg-error-container text-error flex items-center justify-center shrink-0"}>
                              <span className={"material-symbols-outlined text-[20px]"}>
{"picture_as_pdf"}
                              </span>
                            </div>
                            <div className={"flex flex-col min-w-0"}>
                              <span className={"font-label-md text-label-md text-on-surface font-medium truncate"}>
{"Quy-trinh-giao-hang-COD-dong-kiem.pdf"}
                              </span>
                              <span className={"font-caption text-caption text-on-surface-variant"}>
{"88 chunks • Đồng kiểm tiêu chuẩn"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className={"py-4 px-4 whitespace-nowrap text-on-surface-variant"}>
                          <span className={"font-medium text-on-surface"}>
{"PDF"}
                          </span>
{" • 1.2 MB "}
                        </td>
                        <td className={"py-4 px-4"}>
                          <span className={"px-2.5 py-1 rounded-lg bg-surface-container font-label-sm text-label-sm text-on-surface-variant inline-flex items-center gap-1.5"}>
                            <span className={"w-1.5 h-1.5 rounded-full bg-primary"}>

                            </span>
{" Hỗ trợ cửa hàng RAG "}
                          </span>
                        </td>
                        <td className={"py-4 px-4 whitespace-nowrap text-on-surface-variant"}>
{" 22/10/2025 "}
                        </td>
                        <td className={"py-4 px-4 whitespace-nowrap"}>
                          <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface font-medium"}>
                            <span className={"w-2 h-2 rounded-full bg-primary-container"}>

                            </span>
{" Sẵn sàng (READY) "}
                          </span>
                        </td>
                        <td className={"py-4 px-6 text-right whitespace-nowrap"}>
                          <div className={"inline-flex items-center gap-1"}>
                            <button className={"p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"} title={"Xem chi tiết chunks"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"segment"}
                              </span>
                            </button>
                            <button className={"p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"} title={"Xử lý lại"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"replay"}
                              </span>
                            </button>
                            <button className={"p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"} title={"Vô hiệu hóa"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"toggle_on"}
                              </span>
                            </button>
                            <button className={"p-1.5 rounded-lg text-error hover:bg-error-container/40 transition-colors"} title={"Xóa"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"delete"}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr className={"hover:bg-surface-container-low/40 transition-colors"}>
                        <td className={"py-4 px-6"}>
                          <div className={"flex items-center gap-3"}>
                            <div className={"w-9 h-9 rounded-lg bg-error-container text-error flex items-center justify-center shrink-0"}>
                              <span className={"material-symbols-outlined text-[20px]"}>
{"picture_as_pdf"}
                              </span>
                            </div>
                            <div className={"flex flex-col min-w-0"}>
                              <span className={"font-label-md text-label-md text-on-surface font-medium truncate"}>
{"Dieu-kien-doi-tra-7-ngay.pdf"}
                              </span>
                              <span className={"font-caption text-caption text-on-surface-variant"}>
{"64 chunks • Quy chuẩn phụ kiện & máy"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className={"py-4 px-4 whitespace-nowrap text-on-surface-variant"}>
                          <span className={"font-medium text-on-surface"}>
{"PDF"}
                          </span>
{" • 950 KB "}
                        </td>
                        <td className={"py-4 px-4"}>
                          <span className={"px-2.5 py-1 rounded-lg bg-surface-container font-label-sm text-label-sm text-on-surface-variant inline-flex items-center gap-1.5"}>
                            <span className={"w-1.5 h-1.5 rounded-full bg-primary"}>

                            </span>
{" Hỗ trợ cửa hàng RAG "}
                          </span>
                        </td>
                        <td className={"py-4 px-4 whitespace-nowrap text-on-surface-variant"}>
{" 23/10/2025 "}
                        </td>
                        <td className={"py-4 px-4 whitespace-nowrap"}>
                          <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface font-medium"}>
                            <span className={"w-2 h-2 rounded-full bg-primary-container"}>

                            </span>
{" Sẵn sàng (READY) "}
                          </span>
                        </td>
                        <td className={"py-4 px-6 text-right whitespace-nowrap"}>
                          <div className={"inline-flex items-center gap-1"}>
                            <button className={"p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"} title={"Xem chi tiết chunks"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"segment"}
                              </span>
                            </button>
                            <button className={"p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"} title={"Xử lý lại"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"replay"}
                              </span>
                            </button>
                            <button className={"p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"} title={"Vô hiệu hóa"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"toggle_on"}
                              </span>
                            </button>
                            <button className={"p-1.5 rounded-lg text-error hover:bg-error-container/40 transition-colors"} title={"Xóa"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"delete"}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr className={"bg-secondary-fixed/20 hover:bg-secondary-fixed/30 transition-colors"}>
                        <td className={"py-4 px-6"}>
                          <div className={"flex items-center gap-3"}>
                            <div className={"w-9 h-9 rounded-lg bg-error-container text-error flex items-center justify-center shrink-0"}>
                              <span className={"material-symbols-outlined text-[20px]"}>
{"picture_as_pdf"}
                              </span>
                            </div>
                            <div className={"flex flex-col min-w-0"}>
                              <span className={"font-label-md text-label-md text-on-surface font-medium truncate"}>
{"Cam-nang-thong-so-flagship-2024.pdf"}
                              </span>
                              <span className={"font-caption text-caption text-secondary font-medium"}>
{"Đang tạo embeddings (68%)..."}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className={"py-4 px-4 whitespace-nowrap text-on-surface-variant"}>
                          <span className={"font-medium text-on-surface"}>
{"PDF"}
                          </span>
{" • 5.4 MB "}
                        </td>
                        <td className={"py-4 px-4"}>
                          <span className={"px-2.5 py-1 rounded-lg bg-secondary-fixed font-label-sm text-label-sm text-secondary font-medium inline-flex items-center gap-1.5"}>
                            <span className={"w-1.5 h-1.5 rounded-full bg-secondary"}>

                            </span>
{" Tư vấn & So sánh AI "}
                          </span>
                        </td>
                        <td className={"py-4 px-4 whitespace-nowrap text-on-surface-variant"}>
{" 24/10/2025 "}
                        </td>
                        <td className={"py-4 px-4 whitespace-nowrap"}>
                          <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-fixed text-secondary font-label-sm text-label-sm font-medium"}>
                            <span className={"material-symbols-outlined text-[14px] animate-spin"}>
{"progress_activity"}
                            </span>
{" Đang xử lý (68%) "}
                          </span>
                        </td>
                        <td className={"py-4 px-6 text-right whitespace-nowrap"}>
                          <div className={"inline-flex items-center gap-1"}>
                            <button className={"p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container opacity-50 cursor-not-allowed"} disabled={true} title={"Tạm dừng/hủy"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"pause"}
                              </span>
                            </button>
                            <button className={"p-1.5 rounded-lg text-error hover:bg-error-container/40 transition-colors"} title={"Hủy tiến trình"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"close"}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr className={"hover:bg-surface-container-low/40 transition-colors"}>
                        <td className={"py-4 px-6"}>
                          <div className={"flex items-center gap-3"}>
                            <div className={"w-9 h-9 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0"}>
                              <span className={"material-symbols-outlined text-[20px]"}>
{"description"}
                              </span>
                            </div>
                            <div className={"flex flex-col min-w-0"}>
                              <span className={"font-label-md text-label-md text-on-surface font-medium truncate"}>
{"Huong-dan-kiem-tra-IMEI-Apple-Samsung.txt"}
                              </span>
                              <span className={"font-caption text-caption text-on-surface-variant"}>
{"24 chunks • Quy chuẩn tra cứu kích hoạt"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className={"py-4 px-4 whitespace-nowrap text-on-surface-variant"}>
                          <span className={"font-medium text-on-surface"}>
{"TXT"}
                          </span>
{" • 120 KB "}
                        </td>
                        <td className={"py-4 px-4"}>
                          <span className={"px-2.5 py-1 rounded-lg bg-surface-container font-label-sm text-label-sm text-on-surface-variant inline-flex items-center gap-1.5"}>
                            <span className={"w-1.5 h-1.5 rounded-full bg-primary"}>

                            </span>
{" Hỗ trợ cửa hàng RAG "}
                          </span>
                        </td>
                        <td className={"py-4 px-4 whitespace-nowrap text-on-surface-variant"}>
{" 15/10/2025 "}
                        </td>
                        <td className={"py-4 px-4 whitespace-nowrap"}>
                          <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface font-medium"}>
                            <span className={"w-2 h-2 rounded-full bg-primary-container"}>

                            </span>
{" Sẵn sàng (READY) "}
                          </span>
                        </td>
                        <td className={"py-4 px-6 text-right whitespace-nowrap"}>
                          <div className={"inline-flex items-center gap-1"}>
                            <button className={"p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"} title={"Xem chi tiết chunks"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"segment"}
                              </span>
                            </button>
                            <button className={"p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"} title={"Xử lý lại"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"replay"}
                              </span>
                            </button>
                            <button className={"p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"} title={"Vô hiệu hóa"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"toggle_on"}
                              </span>
                            </button>
                            <button className={"p-1.5 rounded-lg text-error hover:bg-error-container/40 transition-colors"} title={"Xóa"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"delete"}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr className={"opacity-60 bg-surface-container-low/20 hover:opacity-90 hover:bg-surface-container-low/50 transition-all"}>
                        <td className={"py-4 px-6"}>
                          <div className={"flex items-center gap-3"}>
                            <div className={"w-9 h-9 rounded-lg bg-surface-container-high text-outline flex items-center justify-center shrink-0"}>
                              <span className={"material-symbols-outlined text-[20px]"}>
{"picture_as_pdf"}
                              </span>
                            </div>
                            <div className={"flex flex-col min-w-0"}>
                              <span className={"font-label-md text-label-md text-on-surface font-medium line-through truncate"}>
{"Bang-gia-phu-kien-cu-2023.pdf"}
                              </span>
                              <span className={"font-caption text-caption text-on-surface-variant"}>
{"Không được đưa vào context prompt"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className={"py-4 px-4 whitespace-nowrap text-on-surface-variant"}>
                          <span className={"font-medium text-on-surface"}>
{"PDF"}
                          </span>
{" • 2.1 MB "}
                        </td>
                        <td className={"py-4 px-4"}>
                          <span className={"px-2.5 py-1 rounded-lg bg-surface-container-high font-label-sm text-label-sm text-outline inline-flex items-center gap-1.5"}>
                            <span className={"w-1.5 h-1.5 rounded-full bg-outline"}>

                            </span>
{" Tài liệu cũ "}
                          </span>
                        </td>
                        <td className={"py-4 px-4 whitespace-nowrap text-on-surface-variant"}>
{" 01/08/2025 "}
                        </td>
                        <td className={"py-4 px-4 whitespace-nowrap"}>
                          <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-medium"}>
                            <span className={"w-2 h-2 rounded-full bg-outline"}>

                            </span>
{" Đã vô hiệu hóa (DISABLED) "}
                          </span>
                        </td>
                        <td className={"py-4 px-6 text-right whitespace-nowrap"}>
                          <div className={"inline-flex items-center gap-1"}>
                            <button className={"p-1.5 rounded-lg text-primary hover:bg-primary-fixed transition-colors"} title={"Kích hoạt lại"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"toggle_off"}
                              </span>
                            </button>
                            <button className={"p-1.5 rounded-lg text-error hover:bg-error-container/40 transition-colors"} title={"Xóa vĩnh viễn"} type={"button"}>
                              <span className={"material-symbols-outlined text-[18px]"}>
{"delete"}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className={"p-4 bg-surface-container-low/40 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant"}>
                  <span>
{"Hiển thị 6 trên 18 tài liệu lưu trữ"}
                  </span>
                  <div className={"flex items-center gap-2"}>
                    <button className={"p-1.5 rounded-lg bg-surface-container opacity-50 cursor-not-allowed"} disabled={true} type={"button"}>
                      <span className={"material-symbols-outlined text-[18px]"}>
{"chevron_left"}
                      </span>
                    </button>
                    <span className={"px-3 py-1 rounded-lg bg-surface-container-lowest font-medium text-on-surface shadow-sm"}>
{"1"}
                    </span>
                    <button className={"p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface"} type={"button"}>
                      <span className={"material-symbols-outlined text-[18px]"}>
{"chevron_right"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <div className={"hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-end"} id={"chunk-drawer"}>
                <div className={"w-full max-w-xl bg-surface-container-lowest h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"}>
                  <div>
                    <div className={"flex items-center justify-between pb-4 border-b border-surface-container"}>
                      <div className={"flex flex-col"}>
                        <span className={"font-headline-sm text-headline-sm text-on-surface font-semibold"}>
{"Chi tiết Chunks Vector"}
                        </span>
                        <span className={"font-body-sm text-body-sm text-on-surface-variant truncate"}>
{"Chinh-sach-bao-hanh-12-thang.pdf"}
                        </span>
                      </div>
                      <button className={"w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container"} type={"button"}>
                        <span className={"material-symbols-outlined text-[20px]"}>
{"close"}
                        </span>
                      </button>
                    </div>
                    <div className={"mt-6 flex flex-col gap-4"}>
                      <div className={"p-4 rounded-xl bg-surface-container-low flex flex-col gap-2"}>
                        <div className={"flex items-center justify-between"}>
                          <span className={"font-caption text-caption text-secondary font-semibold uppercase tracking-wider"}>
{"Chunk #042 • Token count: 218"}
                          </span>
                          <span className={"px-2 py-0.5 rounded bg-surface-container-highest font-caption text-caption"}>
{"Score: 0.94"}
                          </span>
                        </div>
                        <p className={"font-body-sm text-body-sm text-on-surface leading-relaxed"}>
{" \"Khách hàng mua smartphone chính hãng tại hệ thống được áp dụng chế độ 1 đổi 1 trong vòng 30 ngày nếu phát sinh lỗi từ nhà sản xuất (phần cứng bo mạch, màn hình sọc...). Điều kiện: Thân máy không trầy xước cấn móp, đầy đủ hộp và phụ kiện đi kèm theo hóa đơn điện tử.\" "}
                        </p>
                      </div>
                      <div className={"p-4 rounded-xl bg-surface-container-low flex flex-col gap-2"}>
                        <div className={"flex items-center justify-between"}>
                          <span className={"font-caption text-caption text-secondary font-semibold uppercase tracking-wider"}>
{"Chunk #043 • Token count: 184"}
                          </span>
                          <span className={"px-2 py-0.5 rounded bg-surface-container-highest font-caption text-caption"}>
{"Score: 0.89"}
                          </span>
                        </div>
                        <p className={"font-body-sm text-body-sm text-on-surface leading-relaxed"}>
{" \"Từ tháng thứ 2 đến tháng thứ 12: Bảo hành miễn phí theo tiêu chuẩn ủy quyền thương hiệu (Apple Care, Samsung Service Plaza). Thời gian xử lý tiêu chuẩn từ 3 - 7 ngày làm việc.\" "}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={"pt-6 border-t border-surface-container flex justify-end"}>
                    <button className={"px-4 py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md"} type={"button"}>
{" Đóng xem trước "}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
