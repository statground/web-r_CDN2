(function() {
  const query = new URLSearchParams(window.location.search);
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const parts = pathname.split("/").filter(Boolean);
  let route = "list";
  let sub = query.get("sub") || "";
  let orderID = query.get("orderID") || "";
  if (parts[0] === "book") {
    if (parts.length === 1) {
      route = sub ? "detail" : "list";
    } else {
      switch (parts[1]) {
        case "list":
          route = "list";
          sub = parts[2] || sub;
          break;
        case "detail":
          route = "detail";
          sub = parts[2] || sub;
          break;
        case "write":
          route = "write";
          sub = parts[2] || sub;
          break;
        case "edit":
          route = "edit";
          orderID = parts[2] || orderID;
          break;
        case "read":
          route = "read";
          orderID = parts[2] || orderID;
          break;
        default:
          if (parts[2] === "write") {
            route = "write";
            sub = parts[1] || sub;
          } else {
            route = "detail";
            sub = parts[1] || sub;
          }
          break;
      }
    }
  }
  window.WebRBookRouteContext = {
    route,
    sub,
    orderID,
    pathname,
    search: window.location.search
  };
  window.WebRBookPages = window.WebRBookPages || {};
  window.WebRBookIsCuratedAffiliateLink = function isCuratedAffiliateLink(rawURL) {
    try {
      const url = new URL(rawURL);
      return url.protocol === "https:" && url.origin === window.location.origin && !url.username && !url.password && !url.search && !url.hash && /^\/book\/affiliate\/curated\/00[1-8]\/(?:yes24|kyobo)\/$/.test(url.pathname);
    } catch (_) {
      return false;
    }
  };
  window.WebRBookSafeStores = function safeStores(rows, requireHTTPS = false) {
    if (!Array.isArray(rows))
      return [];
    const seen = new Set();
    return rows.map((row) => {
      const name = String((row && row.marketplace) || "").trim();
      const rawURL = String((row && row.url) || "").trim();
      if (!name || !rawURL || /\s/.test(rawURL))
        return null;
      try {
        const url = new URL(rawURL);
        if ((requireHTTPS ? url.protocol !== "https:" : !["http:", "https:"].includes(url.protocol)) || !url.hostname || url.username || url.password || seen.has(name))
          return null;
        seen.add(name);
        return { name, link: url.href };
      } catch (_) {
        return null;
      }
    }).filter(Boolean);
  };
})();
(function() {
  window.WebRBookPages = window.WebRBookPages || {};
  window.WebRBookPages.detail = async function set_main_detail() {
    const ctx = window.WebRBookRouteContext || {};
    const sub = ctx.sub || "";
    const root = document.getElementById("div_main");
    // Book data is localized by the server; these are interface labels only.
    // Keep every locale complete so a language switch never mixes Korean UI
    // labels into a translated book. The book route reloads on language change.
    const detailKeys = ["books", "recommended", "marketplace", "buy", "view", "description", "contents", "publisherReview", "bookInfo", "published", "pages", "size", "publisher", "registration", "regionHint", "tocAll", "tocPartial", "showAll", "collapse", "affiliateNotice", "badRequest", "notFound", "loadError"];
    const detailTranslations = {
      ko: ["도서", "함께 보면 좋은 책", "마켓플레이스", "구매하러 가기", "보러가기", "책 소개", "목차", "출판사 리뷰", "책 정보", "출간", "페이지 수", "크기", "출판사", "ISBN 등록 지역", "ISBN 번호의 등록 그룹입니다. 책의 언어나 인쇄 국가를 뜻하지 않습니다.", "목차 {count}개 항목 전체 표시", "목차 {count}개 항목 중 {shown}개 표시", "목차 전체 보기", "목차 접기", "이 링크를 통해 구매하면 수수료를 제공받을 수 있습니다.", "잘못된 요청입니다. URL에 책 식별자(sub)가 필요합니다.", "해당 ID의 책을 찾을 수 없습니다. (sub: {sub})", "책 정보를 불러오는 데 실패했습니다. 오류: {error}"],
      en: ["Books", "You may also like", "Marketplace", "Buy now", "View", "About this book", "Table of contents", "Publisher's review", "Book details", "Published", "Pages", "Dimensions", "Publisher", "ISBN registration area", "The ISBN registration group does not indicate the book's language or country of printing.", "Showing all {count} contents entries", "Showing {shown} of {count} contents entries", "View full contents", "Collapse contents", "We may receive a commission if you purchase through this link.", "Invalid request: a book identifier (sub) is required in the URL.", "Book not found for this ID (sub: {sub})", "Could not load book details. Error: {error}"],
      ja: ["書籍", "こちらの本もおすすめ", "購入先", "購入する", "見る", "本の紹介", "目次", "出版社レビュー", "書籍情報", "出版日", "ページ数", "サイズ", "出版社", "ISBN登録地域", "ISBNの登録グループです。本の言語や印刷国を示すものではありません。", "目次の全{count}項目を表示中", "目次{count}項目中{shown}項目を表示中", "目次をすべて見る", "目次を閉じる", "このリンクから購入すると手数料を受け取る場合があります。", "無効なリクエストです。URLに書籍識別子（sub）が必要です。", "このIDの本は見つかりません（sub: {sub}）", "書籍情報を読み込めませんでした。エラー: {error}"],
      "zh-Hans": ["图书", "你可能还喜欢", "购买平台", "前往购买", "查看", "图书简介", "目录", "出版社评论", "图书信息", "出版日期", "页数", "尺寸", "出版社", "ISBN注册地区", "ISBN注册组不代表图书语言或印刷国家。", "显示全部{count}项目录", "显示{count}项目录中的{shown}项", "查看完整目录", "收起目录", "通过此链接购买，我们可能会获得佣金。", "请求无效：网址中缺少图书标识（sub）。", "未找到此ID的图书（sub: {sub}）", "无法加载图书信息。错误：{error}"],
      "zh-Hant": ["圖書", "你可能也喜歡", "購買平台", "前往購買", "查看", "圖書簡介", "目錄", "出版社評論", "圖書資訊", "出版日期", "頁數", "尺寸", "出版社", "ISBN註冊地區", "ISBN註冊組不代表書籍語言或印刷國家。", "顯示全部{count}項目錄", "顯示{count}項目錄中的{shown}項", "查看完整目錄", "收合目錄", "透過此連結購買，我們可能會收到佣金。", "請求無效：網址中缺少圖書識別碼（sub）。", "找不到此ID的書籍（sub: {sub}）", "無法載入圖書資訊。錯誤：{error}"],
      es: ["Libros", "También te puede interesar", "Tiendas", "Comprar", "Ver", "Sobre este libro", "Índice", "Reseña de la editorial", "Datos del libro", "Publicado", "Páginas", "Dimensiones", "Editorial", "Zona de registro del ISBN", "El grupo de registro del ISBN no indica el idioma del libro ni el país de impresión.", "Se muestran las {count} entradas del índice", "Se muestran {shown} de {count} entradas del índice", "Ver índice completo", "Contraer índice", "Podemos recibir una comisión si compras mediante este enlace.", "Solicitud no válida: falta el identificador del libro (sub) en la URL.", "No se encontró el libro para este ID (sub: {sub})", "No se pudieron cargar los datos del libro. Error: {error}"],
      fr: ["Livres", "Vous aimerez aussi", "Points de vente", "Acheter", "Voir", "À propos du livre", "Table des matières", "Avis de l'éditeur", "Informations sur le livre", "Parution", "Pages", "Dimensions", "Éditeur", "Zone d'enregistrement ISBN", "Le groupe d'enregistrement ISBN n'indique ni la langue du livre ni le pays d'impression.", "Les {count} entrées du sommaire sont affichées", "{shown} entrées sur {count} du sommaire sont affichées", "Voir tout le sommaire", "Réduire le sommaire", "Nous pouvons percevoir une commission si vous achetez via ce lien.", "Requête invalide : un identifiant de livre (sub) est requis dans l'URL.", "Aucun livre trouvé pour cet ID (sub : {sub})", "Impossible de charger le livre. Erreur : {error}"],
      de: ["Bücher", "Das könnte Sie auch interessieren", "Bezugsquellen", "Kaufen", "Ansehen", "Über dieses Buch", "Inhaltsverzeichnis", "Rezension des Verlags", "Buchdetails", "Erschienen", "Seiten", "Abmessungen", "Verlag", "ISBN-Registrierungsgebiet", "Die ISBN-Registrierungsgruppe gibt weder die Sprache des Buches noch das Druckland an.", "Alle {count} Einträge des Inhaltsverzeichnisses angezeigt", "{shown} von {count} Einträgen des Inhaltsverzeichnisses angezeigt", "Ganzes Inhaltsverzeichnis", "Inhaltsverzeichnis einklappen", "Bei einem Kauf über diesen Link erhalten wir möglicherweise eine Provision.", "Ungültige Anfrage: Die Buchkennung (sub) fehlt in der URL.", "Buch für diese ID nicht gefunden (sub: {sub})", "Buchdetails konnten nicht geladen werden. Fehler: {error}"],
      "pt-BR": ["Livros", "Você também pode gostar", "Lojas", "Comprar", "Ver", "Sobre este livro", "Sumário", "Resenha da editora", "Dados do livro", "Publicado", "Páginas", "Dimensões", "Editora", "Região de registro do ISBN", "O grupo de registro do ISBN não indica o idioma do livro nem o país de impressão.", "Exibindo todas as {count} entradas do sumário", "Exibindo {shown} de {count} entradas do sumário", "Ver sumário completo", "Recolher sumário", "Podemos receber comissão se você comprar por este link.", "Solicitação inválida: falta o identificador do livro (sub) na URL.", "Livro não encontrado para este ID (sub: {sub})", "Não foi possível carregar os dados do livro. Erro: {error}"],
      ru: ["Книги", "Вам также может понравиться", "Магазины", "Купить", "Посмотреть", "О книге", "Содержание", "Отзыв издателя", "Сведения о книге", "Дата издания", "Страниц", "Размеры", "Издательство", "Регион регистрации ISBN", "Группа регистрации ISBN не указывает на язык книги или страну печати.", "Показаны все {count} пункта содержания", "Показано {shown} из {count} пунктов содержания", "Показать всё содержание", "Свернуть содержание", "Мы можем получить комиссию при покупке по этой ссылке.", "Неверный запрос: в URL нет идентификатора книги (sub).", "Книга с этим ID не найдена (sub: {sub})", "Не удалось загрузить сведения о книге. Ошибка: {error}"],
      id: ["Buku", "Buku lain yang mungkin Anda sukai", "Toko buku", "Beli", "Lihat", "Tentang buku ini", "Daftar isi", "Ulasan penerbit", "Informasi buku", "Terbit", "Jumlah halaman", "Ukuran", "Penerbit", "Wilayah pendaftaran ISBN", "Kelompok pendaftaran ISBN tidak menunjukkan bahasa buku atau negara pencetakan.", "Menampilkan seluruh {count} entri daftar isi", "Menampilkan {shown} dari {count} entri daftar isi", "Lihat seluruh daftar isi", "Tutup daftar isi", "Kami mungkin menerima komisi jika Anda membeli melalui tautan ini.", "Permintaan tidak valid: URL memerlukan pengenal buku (sub).", "Buku untuk ID ini tidak ditemukan (sub: {sub})", "Gagal memuat informasi buku. Kesalahan: {error}"],
      vi: ["Sách", "Sách bạn có thể thích", "Nơi mua", "Mua ngay", "Xem", "Giới thiệu sách", "Mục lục", "Nhận xét của nhà xuất bản", "Thông tin sách", "Ngày xuất bản", "Số trang", "Kích thước", "Nhà xuất bản", "Khu vực đăng ký ISBN", "Nhóm đăng ký ISBN không cho biết ngôn ngữ của sách hoặc quốc gia in.", "Hiển thị toàn bộ {count} mục lục", "Hiển thị {shown} trong {count} mục lục", "Xem toàn bộ mục lục", "Thu gọn mục lục", "Chúng tôi có thể nhận hoa hồng nếu bạn mua qua liên kết này.", "Yêu cầu không hợp lệ: URL cần có mã sách (sub).", "Không tìm thấy sách với ID này (sub: {sub})", "Không thể tải thông tin sách. Lỗi: {error}"],
      th: ["หนังสือ", "หนังสือที่คุณอาจชอบ", "ร้านค้า", "ซื้อเลย", "ดู", "เกี่ยวกับหนังสือ", "สารบัญ", "บทวิจารณ์จากสำนักพิมพ์", "ข้อมูลหนังสือ", "วันที่เผยแพร่", "จำนวนหน้า", "ขนาด", "สำนักพิมพ์", "พื้นที่จดทะเบียน ISBN", "กลุ่มจดทะเบียน ISBN ไม่ได้บอกภาษาของหนังสือหรือประเทศที่พิมพ์", "แสดงสารบัญทั้งหมด {count} รายการ", "แสดง {shown} จาก {count} รายการในสารบัญ", "ดูสารบัญทั้งหมด", "ย่อสารบัญ", "เราอาจได้รับค่าคอมมิชชันหากคุณซื้อผ่านลิงก์นี้", "คำขอไม่ถูกต้อง: URL ต้องมีรหัสหนังสือ (sub)", "ไม่พบหนังสือสำหรับ ID นี้ (sub: {sub})", "ไม่สามารถโหลดข้อมูลหนังสือได้ ข้อผิดพลาด: {error}"],
      ms: ["Buku", "Anda mungkin juga suka", "Tempat membeli", "Beli sekarang", "Lihat", "Mengenai buku ini", "Isi kandungan", "Ulasan penerbit", "Maklumat buku", "Diterbitkan", "Halaman", "Saiz", "Penerbit", "Kawasan pendaftaran ISBN", "Kumpulan pendaftaran ISBN tidak menunjukkan bahasa buku atau negara cetakan.", "Memaparkan semua {count} entri isi kandungan", "Memaparkan {shown} daripada {count} entri isi kandungan", "Lihat isi kandungan penuh", "Tutup isi kandungan", "Kami mungkin menerima komisen jika anda membeli melalui pautan ini.", "Permintaan tidak sah: URL memerlukan pengecam buku (sub).", "Buku bagi ID ini tidak ditemui (sub: {sub})", "Tidak dapat memuatkan maklumat buku. Ralat: {error}"],
      fil: ["Mga aklat", "Maaaring magustuhan mo rin", "Mga tindahan", "Bumili", "Tingnan", "Tungkol sa aklat", "Talaan ng nilalaman", "Pagsusuri ng tagapaglathala", "Detalye ng aklat", "Inilathala", "Mga pahina", "Sukat", "Tagapaglathala", "Lugar ng pagpaparehistro ng ISBN", "Hindi ipinapahiwatig ng pangkat ng pagpaparehistro ng ISBN ang wika ng aklat o bansa ng paglilimbag.", "Ipinapakita ang lahat ng {count} aytem sa talaan", "Ipinapakita ang {shown} sa {count} aytem sa talaan", "Tingnan ang buong talaan", "Itiklop ang talaan", "Maaari kaming makatanggap ng komisyon kung bibili ka sa link na ito.", "Di-wastong kahilingan: kailangan ang ID ng aklat (sub) sa URL.", "Hindi makita ang aklat para sa ID na ito (sub: {sub})", "Hindi ma-load ang detalye ng aklat. Error: {error}"],
      hi: ["पुस्तकें", "आपको ये पुस्तकें भी पसंद आ सकती हैं", "खरीदने के विकल्प", "खरीदें", "देखें", "इस पुस्तक के बारे में", "विषय-सूची", "प्रकाशक की समीक्षा", "पुस्तक विवरण", "प्रकाशित", "पृष्ठ", "आकार", "प्रकाशक", "ISBN पंजीकरण क्षेत्र", "ISBN पंजीकरण समूह पुस्तक की भाषा या मुद्रण देश नहीं बताता।", "विषय-सूची की सभी {count} प्रविष्टियाँ दिख रही हैं", "विषय-सूची की {count} में से {shown} प्रविष्टियाँ दिख रही हैं", "पूरी विषय-सूची देखें", "विषय-सूची समेटें", "इस लिंक से खरीदने पर हमें कमीशन मिल सकता है।", "अमान्य अनुरोध: URL में पुस्तक पहचानकर्ता (sub) चाहिए।", "इस ID की पुस्तक नहीं मिली (sub: {sub})", "पुस्तक विवरण लोड नहीं हो सका। त्रुटि: {error}"],
      ar: ["الكتب", "قد تعجبك أيضًا", "أماكن الشراء", "اشترِ الآن", "عرض", "عن هذا الكتاب", "جدول المحتويات", "مراجعة الناشر", "تفاصيل الكتاب", "تاريخ النشر", "الصفحات", "الأبعاد", "الناشر", "منطقة تسجيل ISBN", "لا تشير مجموعة تسجيل ISBN إلى لغة الكتاب أو بلد الطباعة.", "عرض جميع عناصر المحتويات وعددها {count}", "عرض {shown} من أصل {count} عنصرًا في المحتويات", "عرض المحتويات كاملة", "طي المحتويات", "قد نتلقى عمولة إذا اشتريت عبر هذا الرابط.", "طلب غير صالح: يلزم معرّف الكتاب (sub) في الرابط.", "لم يُعثر على كتاب بهذا المعرّف (sub: {sub})", "تعذّر تحميل تفاصيل الكتاب. الخطأ: {error}"],
      it: ["Libri", "Potrebbe piacerti anche", "Dove acquistare", "Acquista", "Visualizza", "Informazioni sul libro", "Indice", "Recensione dell'editore", "Dettagli del libro", "Pubblicato", "Pagine", "Dimensioni", "Editore", "Area di registrazione ISBN", "Il gruppo di registrazione ISBN non indica la lingua del libro né il Paese di stampa.", "Visualizzate tutte le {count} voci dell'indice", "Visualizzate {shown} voci su {count} dell'indice", "Mostra tutto l'indice", "Riduci l'indice", "Potremmo ricevere una commissione se acquisti tramite questo link.", "Richiesta non valida: nell'URL manca l'identificativo del libro (sub).", "Libro non trovato per questo ID (sub: {sub})", "Impossibile caricare i dettagli del libro. Errore: {error}"],
      nl: ["Boeken", "Misschien ook interessant", "Verkooppunten", "Kopen", "Bekijken", "Over dit boek", "Inhoudsopgave", "Recensie van de uitgever", "Boekgegevens", "Uitgegeven", "Pagina's", "Afmetingen", "Uitgever", "ISBN-registratiegebied", "De ISBN-registratiegroep zegt niets over de taal van het boek of het land waar het is gedrukt.", "Alle {count} inhoudsitems worden getoond", "{shown} van {count} inhoudsitems worden getoond", "Volledige inhoudsopgave", "Inhoudsopgave inklappen", "We kunnen een commissie ontvangen als u via deze link koopt.", "Ongeldig verzoek: een boek-ID (sub) ontbreekt in de URL.", "Boek met dit ID niet gevonden (sub: {sub})", "Boekgegevens konden niet worden geladen. Fout: {error}"],
      pl: ["Książki", "Może Ci się też spodobać", "Miejsca zakupu", "Kup", "Zobacz", "O książce", "Spis treści", "Recenzja wydawcy", "Informacje o książce", "Wydano", "Strony", "Wymiary", "Wydawca", "Obszar rejestracji ISBN", "Grupa rejestracji ISBN nie oznacza języka książki ani kraju druku.", "Wyświetlono wszystkie {count} pozycji spisu treści", "Wyświetlono {shown} z {count} pozycji spisu treści", "Pokaż cały spis treści", "Zwiń spis treści", "Możemy otrzymać prowizję, jeśli kupisz przez ten link.", "Nieprawidłowe żądanie: w adresie URL brakuje identyfikatora książki (sub).", "Nie znaleziono książki o tym ID (sub: {sub})", "Nie udało się wczytać informacji o książce. Błąd: {error}"],
      sv: ["Böcker", "Du kanske också gillar", "Köpställen", "Köp", "Visa", "Om boken", "Innehållsförteckning", "Förlagets recension", "Bokinformation", "Utgiven", "Sidor", "Mått", "Förlag", "ISBN-registreringsområde", "ISBN-registreringsgruppen anger inte bokens språk eller tryckland.", "Visar alla {count} poster i innehållsförteckningen", "Visar {shown} av {count} poster i innehållsförteckningen", "Visa hela innehållsförteckningen", "Dölj innehållsförteckningen", "Vi kan få provision om du köper via den här länken.", "Ogiltig begäran: bokidentifieraren (sub) saknas i webbadressen.", "Ingen bok hittades med detta ID (sub: {sub})", "Det gick inte att läsa in bokinformationen. Fel: {error}"],
      tr: ["Kitaplar", "Bunları da beğenebilirsiniz", "Satış noktaları", "Satın al", "Görüntüle", "Bu kitap hakkında", "İçindekiler", "Yayıncı değerlendirmesi", "Kitap bilgileri", "Yayımlanma", "Sayfalar", "Boyutlar", "Yayıncı", "ISBN kayıt bölgesi", "ISBN kayıt grubu kitabın dilini veya basıldığı ülkeyi göstermez.", "İçindekilerdeki {count} öğenin tamamı gösteriliyor", "İçindekilerdeki {count} öğeden {shown} tanesi gösteriliyor", "İçindekilerin tamamını göster", "İçindekileri daralt", "Bu bağlantıdan satın alırsanız komisyon alabiliriz.", "Geçersiz istek: URL'de kitap kimliği (sub) gerekli.", "Bu kimliğe ait kitap bulunamadı (sub: {sub})", "Kitap bilgileri yüklenemedi. Hata: {error}"],
      uk: ["Книги", "Вам також може сподобатися", "Місця придбання", "Купити", "Переглянути", "Про книгу", "Зміст", "Відгук видавця", "Відомості про книгу", "Опубліковано", "Сторінки", "Розміри", "Видавець", "Регіон реєстрації ISBN", "Група реєстрації ISBN не визначає мову книги чи країну друку.", "Показано всі {count} пункти змісту", "Показано {shown} з {count} пунктів змісту", "Показати весь зміст", "Згорнути зміст", "Ми можемо отримати комісію, якщо ви купите за цим посиланням.", "Недійсний запит: у URL потрібен ідентифікатор книги (sub).", "Книгу з таким ID не знайдено (sub: {sub})", "Не вдалося завантажити відомості про книгу. Помилка: {error}"]
    };
    const detailLocale = window.WebRI18n?.language || new URLSearchParams(window.location.search).get("lang") || document.documentElement.lang || "ko";
    const detailWords = detailTranslations[detailLocale] || detailTranslations.en;
    const detailText = (key, vars = {}) => {
      const index = detailKeys.indexOf(key);
      const phrase = detailWords[index] || detailTranslations.en[index] || key;
      return phrase.replace(/\{(count|shown|sub|error)\}/g, (match, name) => Object.hasOwn(vars, name) ? String(vars[name]) : match);
    };
    const header_title = detailText("books");
    const header_subtitle = "";
    const SkelLine = ({ w = "100%", h = 12, r = 8, style = {} }) => /* @__PURE__ */ React.createElement("div", { className: "bg-gray-200 animate-pulse", style: { width: w, height: h, borderRadius: r, ...style } });
    const SkelBox = ({ w = "100%", h = 120, r = 12, style = {} }) => /* @__PURE__ */ React.createElement("div", { className: "bg-gray-200 animate-pulse", style: { width: w, height: h, borderRadius: r, ...style } });
    function Div_BookDetailSkeleton() {
      const [isDesktop, setIsDesktop] = React.useState(typeof window !== "undefined" ? window.innerWidth >= 1024 : true);
      React.useEffect(() => {
        let rafId = null;
        const onResize = () => {
          if (rafId)
            cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => setIsDesktop(window.innerWidth >= 1024));
        };
        window.addEventListener("resize", onResize, { passive: true });
        return () => {
          if (rafId)
            cancelAnimationFrame(rafId);
          window.removeEventListener("resize", onResize);
        };
      }, []);
      const coverWidth = isDesktop ? "320px" : "100%";
      const coverHeight = isDesktop ? 520 : "0";
      const coverPaddingBottom = isDesktop ? "0" : "150%";
      const priceGridCols = isDesktop ? "grid-cols-3" : "grid-cols-2";
      const recoGridCols = isDesktop ? "grid-cols-4" : "grid-cols-2";
      const metaWidth1 = isDesktop ? "60%" : "65%";
      const metaWidth2 = isDesktop ? "85%" : "92%";
      const tabWidths = isDesktop ? ["84px", "92px", "102px", "86px"] : ["90px", "98px", "106px", "92px"];
      const contentWidth1 = isDesktop ? "45%" : "60%";
      const contentWidth2 = isDesktop ? "95%" : "100%";
      const contentWidth3 = isDesktop ? "88%" : "92%";
      const contentWidth4 = isDesktop ? "70%" : "80%";
      const priceLineWidth = isDesktop ? "45%" : "55%";
      const recoLineWidth1 = isDesktop ? "90%" : "95%";
      const recoLineWidth2 = isDesktop ? "65%" : "70%";
      return /* @__PURE__ */ React.createElement("main", { id: "page-books-skeleton", className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28" }, /* @__PURE__ */ React.createElement(Div_page_header, { title: header_title, subtitle: header_subtitle }), /* @__PURE__ */ React.createElement("section", { id: "book-detail-skeleton", className: "w-full" }, /* @__PURE__ */ React.createElement("div", { className: isDesktop ? "flex gap-6 items-start" : "flex flex-col gap-4 items-stretch" }, /* @__PURE__ */ React.createElement("aside", { className: isDesktop ? "shrink-0" : "w-full", style: { width: coverWidth } }, /* @__PURE__ */ React.createElement("div", { className: "rounded-lg overflow-hidden" }, /* @__PURE__ */ React.createElement(SkelBox, { h: coverHeight, style: { paddingBottom: coverPaddingBottom } }))), /* @__PURE__ */ React.createElement("section", { className: isDesktop ? "flex-1 flex flex-col gap-4" : "w-full" }, /* @__PURE__ */ React.createElement("div", { className: "rounded-lg p-4 border border-gray-100" }, /* @__PURE__ */ React.createElement(SkelLine, { w: metaWidth1, h: 26, style: { marginBottom: 10 } }), /* @__PURE__ */ React.createElement(SkelLine, { w: metaWidth2, h: 14 })), /* @__PURE__ */ React.createElement("div", { className: "rounded-lg p-4 border border-gray-100" }, /* @__PURE__ */ React.createElement(SkelLine, { w: "120px", h: 18, style: { marginBottom: 14 } }), /* @__PURE__ */ React.createElement("div", { className: `grid ${priceGridCols} gap-3` }, [0, 1, 2].map((i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "border border-gray-200 rounded-lg p-3" }, /* @__PURE__ */ React.createElement(SkelLine, { w: priceLineWidth, h: 14 }), /* @__PURE__ */ React.createElement(SkelLine, { w: "100%", h: 36, style: { marginTop: 14, borderRadius: 10 } })))), /* @__PURE__ */ React.createElement(SkelLine, { w: isDesktop ? "60%" : "75%", h: 12, style: { marginTop: 14 } })), /* @__PURE__ */ React.createElement("div", { className: "rounded-lg p-4 border border-gray-100" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 flex-wrap mb-3" }, tabWidths.map((width, i) => /* @__PURE__ */ React.createElement(SkelLine, { key: i, w: width, h: 30 }))), /* @__PURE__ */ React.createElement(SkelLine, { w: contentWidth1, h: 16, style: { marginBottom: 10 } }), /* @__PURE__ */ React.createElement(SkelLine, { w: contentWidth2, h: 12, style: { marginBottom: 8 } }), /* @__PURE__ */ React.createElement(SkelLine, { w: contentWidth3, h: 12, style: { marginBottom: 8 } }), /* @__PURE__ */ React.createElement(SkelLine, { w: contentWidth4, h: 12 })), /* @__PURE__ */ React.createElement("div", { className: "rounded-lg p-4 border border-gray-100" }, /* @__PURE__ */ React.createElement(SkelLine, { w: isDesktop ? "180px" : "190px", h: 18, style: { marginBottom: 14 } }), /* @__PURE__ */ React.createElement("div", { className: `grid ${recoGridCols} gap-3` }, [0, 1, 2, 3].map((i) => /* @__PURE__ */ React.createElement("div", { key: i }, /* @__PURE__ */ React.createElement("div", { className: "w-full h-0 pb-[133%] bg-gray-200 rounded-lg animate-pulse" }), /* @__PURE__ */ React.createElement(SkelLine, { w: recoLineWidth1, h: 14, style: { marginTop: 8, marginBottom: 6 } }), /* @__PURE__ */ React.createElement(SkelLine, { w: recoLineWidth2, h: 12 })))))))));
    }
    function sanitizeHtml(html) {
      return (html || "").replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/\s(on\w+)=(".*?"|'.*?'|[^\s>]+)/gi, "");
    }
    function getRandomItems(array, n) {
      const shuffled = [...array].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, n);
    }
    function plainParagraphs(content) {
      return String(content || "").replace(/\r\n?/g, "\n").split(/\n\s*\n/).flatMap((block) => {
        const sentences = block.replace(/[ \t]+/g, " ").trim().split(/(?<=[.!?。])\s+(?=\S)/u).filter(Boolean);
        const paragraphs = [];
        let current = "";
        sentences.forEach((sentence) => {
          if (current && current.length + sentence.length > 260) {
            paragraphs.push(current);
            current = "";
          }
          current += (current ? " " : "") + sentence;
        });
        if (current)
          paragraphs.push(current);
        return paragraphs;
      });
    }
    function plainContentsItems(content) {
      const original = String(content || "").replace(/\r\n?/g, "\n").trim();
      if (!original)
        return [];
      if (original.includes("\n"))
        return original.split(/\n+/).map((line) => line.trim()).filter(Boolean);
      const text = original.replace(/\s+/g, " ");
      const marker = /(^|\s)(Part\s+\d+\.?|제\s*\d+\s*장|제\s*\d+\s*절|\d+\s*장|[IVX]+\.(?=\s)|[IVX]+(?=\s+[가-힣])|\d+(?:\.\d+)+(?=\s)|\d+(?=\s+[가-힣A-Za-z])|부록(?:\s+\d+)?|참고문헌|찾아보기)(?=\s|$)/giu;
      const starts = [...text.matchAll(marker)].map((match) => match.index + match[1].length);
      if (starts.length < 2)
        return [text];
      const items = [];
      if (starts[0] > 0)
        items.push(text.slice(0, starts[0]).trim());
      starts.forEach((start, index) => items.push(text.slice(start, starts[index + 1] || text.length).trim()));
      return items.filter(Boolean);
    }
    function PlainTextSection({ title, content, contents = false }) {
      const items = contents ? plainContentsItems(content) : plainParagraphs(content);
      const [expanded, setExpanded] = React.useState(false);
      const longContents = contents && items.length > 24;
      return /* @__PURE__ */ React.createElement("section", { className: "bd-text-section", "aria-label": title }, /* @__PURE__ */ React.createElement("h3", null, title), longContents ? /* @__PURE__ */ React.createElement("div", { className: "bd-toc-toolbar" }, /* @__PURE__ */ React.createElement("span", null, expanded ? detailText("tocAll", { count: items.length }) : detailText("tocPartial", { count: items.length, shown: 12 })), /* @__PURE__ */ React.createElement("button", { type: "button", "aria-controls": "book-plain-contents-list", "aria-expanded": expanded, onClick: () => setExpanded((value) => !value) }, expanded ? detailText("collapse") : detailText("showAll"))) : null, contents && items.length > 1 ? /* @__PURE__ */ React.createElement("ol", { className: "bd-plain-toc", id: "book-plain-contents-list" }, items.map((item, index) => /* @__PURE__ */ React.createElement("li", { key: index, hidden: longContents && !expanded && index >= 12 }, item))) : /* @__PURE__ */ React.createElement("div", { className: "bd-plain-prose" }, items.map((item, index) => /* @__PURE__ */ React.createElement("p", { key: index }, item))));
    }
    const HtmlSection = ({ title, html, plainText, contents = false }) => plainText ? /* @__PURE__ */ React.createElement(PlainTextSection, { title, content: html, contents }) : /* @__PURE__ */ React.createElement("section", { className: "prose max-w-none prose-neutral" }, title ? /* @__PURE__ */ React.createElement("h3", { className: "m-0 mb-2 font-semibold text-xl" }, title) : null, /* @__PURE__ */ React.createElement("div", { dangerouslySetInnerHTML: { __html: sanitizeHtml(html) } }));
    function Div_RecommendedBooks({ books, gridCols = "grid-cols-4" }) {
      return /* @__PURE__ */ React.createElement("div", { className: "bd-card my-4" }, /* @__PURE__ */ React.createElement("div", { className: "bd-row" }, /* @__PURE__ */ React.createElement("h2", { className: "font-semibold text-xl" }, detailText("recommended"))), /* @__PURE__ */ React.createElement("div", { className: `grid ${gridCols} gap-3 mt-3` }, books.map((book) => /* @__PURE__ */ React.createElement(
        "a",
        {
          className: "bd-book",
          href: `/book/${book.uuid_board_category}/`,
          key: book.uuid_board_category,
          style: { textDecoration: "none", color: "inherit" }
        },
        /* @__PURE__ */ React.createElement("div", { className: "bd-aspect" }, /* @__PURE__ */ React.createElement("img", { className: "w-full rounded-lg", src: book.cover, alt: book.alt })),
        /* @__PURE__ */ React.createElement("div", { className: "mt-2 text-sm font-semibold leading-snug" }, book.title),
        /* @__PURE__ */ React.createElement("div", { className: "bd-small mt-0.5 text-gray-400 text-xs" }, book.author)
      ))));
    }
    function Div_PriceCompare({ stores, gridCols = "grid-cols-3" }) {
      if (!stores || stores.length === 0)
        return null;
      const isAffiliateLink = window.WebRBookIsCuratedAffiliateLink;
      const hasAffiliateLink = stores.some((store) => isAffiliateLink(store.link));
      const logoMap = {
        "\uAD50\uBCF4\uBB38\uACE0": "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/book/kyobobook2.png",
        "Yes24": "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/book/yes24.png",
        "\uC601\uD48D\uBB38\uACE0": "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/book/ypbooks.png",
        "\uCFE0\uD321": "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/book/coupang.png",
        "LeanPub": "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/book/LeanPub.png",
        "Bookdown": "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/book/bookdown.png",
        default: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/book/icon_default.png"
      };
      const purchaseMarkets = ["\uAD50\uBCF4\uBB38\uACE0", "\uCFE0\uD321", "\uC601\uD48D\uBB38\uACE0", "Yes24"];
      return /* @__PURE__ */ React.createElement("div", { className: "bd-card my-4" }, /* @__PURE__ */ React.createElement("h2", { className: "mb-3 font-semibold text-xl" }, detailText("marketplace")), /* @__PURE__ */ React.createElement("div", { className: `grid ${gridCols} gap-3` }, stores.map((store, idx) => /* @__PURE__ */ React.createElement("div", { className: "bd-soft border border-gray-200 rounded-lg p-3", key: `${store.name}-${idx}` }, /* @__PURE__ */ React.createElement("div", { className: "bd-row flex justify-center items-center" }, /* @__PURE__ */ React.createElement("img", { src: logoMap[store.name] || logoMap.default, alt: store.name, className: "w-10 h-10 mr-2" }), /* @__PURE__ */ React.createElement("div", { className: "font-semibold" }, store.name)), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center mt-3" }, /* @__PURE__ */ React.createElement(
        "a",
        {
          href: store.link,
          target: "_blank",
          rel: isAffiliateLink(store.link) ? "nofollow sponsored noreferrer noopener" : "noreferrer noopener",
          className: "bd-btn inline-block bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200"
        },
        purchaseMarkets.includes(store.name) ? detailText("buy") : detailText("view")
      ))))), hasAffiliateLink ? /* @__PURE__ */ React.createElement("p", { className: "mt-3 text-xs text-gray-500" }, detailText("affiliateNotice")) : null);
    }
    function Div_BookMeta({ title, subtitle }) {
      return /* @__PURE__ */ React.createElement("div", { className: "bd-card" }, /* @__PURE__ */ React.createElement("div", { className: "bd-row flex items-start" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "bd-title text-2xl font-bold mb-1.5" }, title), /* @__PURE__ */ React.createElement("p", { className: "bd-sub text-gray-500" }, subtitle))));
    }
    const Div_BookDescription = ({ content, plainText }) => content ? /* @__PURE__ */ React.createElement(HtmlSection, { title: detailText("description"), html: content, plainText }) : null;
    const Div_BookContents = ({ content, plainText }) => content ? /* @__PURE__ */ React.createElement(HtmlSection, { title: detailText("contents"), html: content, plainText, contents: true }) : null;
    const Div_PublisherReview = ({ content, plainText }) => content ? /* @__PURE__ */ React.createElement(HtmlSection, { title: detailText("publisherReview"), html: content, plainText }) : null;
    function Div_ProductInfo({ published_at, page_cnt, size, publisher, isbn_registration_group_label }) {
      const isbnRegistrationGroup = typeof isbn_registration_group_label === "string" ? isbn_registration_group_label.trim() : "";
      if (!published_at && !page_cnt && !size && !publisher && !isbnRegistrationGroup)
        return null;
      const row = (label, value, attributes = {}) => {
        if (!value) return null;
        const valueAttributes = attributes["data-webr-value-content"] !== void 0 ? { "data-webr-user-content": "" } : {};
        return /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "text-left px-4 py-2 font-medium", ...attributes }, label), /* @__PURE__ */ React.createElement("td", { className: "py-2", ...valueAttributes }, value));
      };
      return /* @__PURE__ */ React.createElement("div", { className: "bd-card" }, /* @__PURE__ */ React.createElement("h3", { className: "m-0 mb-2 font-semibold text-xl" }, detailText("bookInfo")), /* @__PURE__ */ React.createElement("table", { className: "w-full", style: { fontSize: "14px" } }, /* @__PURE__ */ React.createElement("tbody", null,
        row(detailText("published"), published_at),
        row(detailText("pages"), page_cnt),
        row(detailText("size"), size),
        row(detailText("publisher"), publisher),
        row(detailText("registration"), isbnRegistrationGroup, {
          "data-webr-value-content": "",
          title: detailText("regionHint"),
          "aria-description": detailText("regionHint")
        })
      )));
    }
    function Div_BookDetail({ bookData, stores, recommendedBooks }) {
      const plainText = bookData.content_format === "plain_text";
      const [isDesktop, setIsDesktop] = React.useState(typeof window !== "undefined" ? window.innerWidth >= 1024 : true);
      React.useEffect(() => {
        let rafId = null;
        const onResize = () => {
          if (rafId)
            cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => setIsDesktop(window.innerWidth >= 1024));
        };
        window.addEventListener("resize", onResize, { passive: true });
        return () => {
          if (rafId)
            cancelAnimationFrame(rafId);
          window.removeEventListener("resize", onResize);
        };
      }, []);
      const coverWidthDesktop = "320px";
      const coverMaxHeightDesktop = 520;
      const priceGridCols = isDesktop ? "grid-cols-3" : "grid-cols-2";
      const recoGridCols = isDesktop ? "grid-cols-4" : "grid-cols-2";
      const randomStore = stores && stores.length > 0 ? stores[Math.floor(Math.random() * stores.length)] : null;
      const randomStoreLink = randomStore ? randomStore.link : "";
      const coverImage = /* @__PURE__ */ React.createElement(
        "img",
        {
          className: "w-full rounded-lg block object-contain",
          src: bookData.url_image,
          alt: bookData.title,
          style: { height: "auto", maxHeight: isDesktop ? coverMaxHeightDesktop : "none" }
        }
      );
      const coverContent = randomStoreLink ? /* @__PURE__ */ React.createElement("a", { href: randomStoreLink, target: "_blank", rel: window.WebRBookIsCuratedAffiliateLink(randomStoreLink) ? "nofollow sponsored noreferrer noopener" : "noreferrer noopener" }, coverImage) : coverImage;
      const coverBox = /* @__PURE__ */ React.createElement("div", { className: "rounded-lg overflow-hidden relative", style: { width: isDesktop ? coverWidthDesktop : "50%", maxWidth: isDesktop ? coverWidthDesktop : "360px" } }, coverContent);
      return /* @__PURE__ */ React.createElement("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28" }, /* @__PURE__ */ React.createElement(Div_page_header, { title: header_title, subtitle: bookData.title }), /* @__PURE__ */ React.createElement("section", { id: "book-detail", className: "w-full" }, /* @__PURE__ */ React.createElement("div", { className: isDesktop ? "flex gap-6 items-start" : "flex flex-col gap-4 items-stretch" }, /* @__PURE__ */ React.createElement("aside", { className: isDesktop ? "shrink-0" : "w-full flex justify-center", style: { width: isDesktop ? coverWidthDesktop : "100%" } }, coverBox), /* @__PURE__ */ React.createElement("section", { className: isDesktop ? "flex-1 flex flex-col gap-4" : "w-full flex flex-col gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "my-4" }, /* @__PURE__ */ React.createElement(Div_BookMeta, { title: bookData.title, subtitle: bookData.subtitle })), /* @__PURE__ */ React.createElement("div", { className: "my-4" }, /* @__PURE__ */ React.createElement(Div_PriceCompare, { stores, gridCols: priceGridCols })), /* @__PURE__ */ React.createElement(Div_BookDescription, { content: bookData.introduction, plainText }), /* @__PURE__ */ React.createElement(Div_BookContents, { content: bookData.contents, plainText }), /* @__PURE__ */ React.createElement(Div_PublisherReview, { content: bookData.publisher_review, plainText }), /* @__PURE__ */ React.createElement(
        Div_ProductInfo,
        {
          published_at: bookData.published_at,
          page_cnt: bookData.page_cnt,
          size: bookData.size,
          publisher: bookData.publisher,
          isbn_registration_group_label: bookData.isbn_registration_group_label
        }
      ), /* @__PURE__ */ React.createElement("div", { className: "my-4" }, /* @__PURE__ */ React.createElement(Div_RecommendedBooks, { books: recommendedBooks, gridCols: recoGridCols }))))));
    }
    if (!root)
      return;
    ReactDOM.render(/* @__PURE__ */ React.createElement(Div_BookDetailSkeleton, null), root);
    if (!sub) {
      ReactDOM.render(
        /* @__PURE__ */ React.createElement("div", { className: "max-w-screen-xl mx-auto px-6 py-8 text-red-600" }, detailText("badRequest")),
        root
      );
      return;
    }
    try {
      const response = await fetch("/book/ajax_get_book_list/", { method: "POST", headers: { "Content-Type": "application/json" } });
      if (!response.ok)
        throw new Error(`HTTP ${response.status}`);
      const data_list = await response.json();
      const values = Object.values(data_list || {});
      const bookData = values.find((item) => item.uuid_board_category === sub);
      if (!bookData) {
        ReactDOM.render(
          /* @__PURE__ */ React.createElement("div", { className: "max-w-screen-xl mx-auto px-6 py-8 text-red-600" }, detailText("notFound", { sub })),
          root
        );
        return;
      }
      const subtitleParts = [];
      if (bookData.publisher)
        subtitleParts.push(bookData.publisher);
      if (bookData.published_at)
        subtitleParts.push(bookData.published_at);
      if (bookData.isbn)
        subtitleParts.push(`ISBN ${bookData.isbn}`);
      bookData.subtitle = subtitleParts.join(" \xB7 ");
      let stores = window.WebRBookSafeStores(values.filter((item) => item.uuid_board_category === sub));
      if (bookData.content_format === "plain_text") {
        stores = [];
        try {
          const requestData = new FormData();
          requestData.append("tag_sub", bookData.board_url_sub || sub);
          const infoResponse = await fetch("/book/ajax_get_book_info/", { method: "POST", body: requestData });
          if (infoResponse.ok) {
            const info = await infoResponse.json();
            stores = window.WebRBookSafeStores(info && info.links, true);
          }
        } catch (_) {
          // Metadata remains visible when optional marketplace lookup fails.
        }
      }
      const uniqueRecommended = [...new Map(
        values.filter((item) => item.uuid_board_category !== sub).map((item) => [item.uuid_board_category, item])
      ).values()];
      const recommendedBooks = getRandomItems(uniqueRecommended, 4).map((item) => ({
        cover: item.url_image,
        alt: item.title,
        title: item.title,
        author: item.publisher,
        uuid_board_category: item.uuid_board_category
      }));
      ReactDOM.render(/* @__PURE__ */ React.createElement(Div_BookDetail, { bookData, stores, recommendedBooks }), root);
    } catch (error) {
      ReactDOM.render(
        /* @__PURE__ */ React.createElement("div", { className: "max-w-screen-xl mx-auto px-6 py-8 text-red-600" }, detailText("loadError", { error: error.message })),
        root
      );
    }
  };
})();
(function() {
  window.WebRBookPages = window.WebRBookPages || {};
  window.WebRBookPages.list = async function set_main_list() {
    const ctx = window.WebRBookRouteContext || {};
    const root = document.getElementById("div_main");
    const header_title = "\uB3C4\uC11C";
    const header_subtitle = "\uB3C4\uC11C \uC18C\uAC1C\uC640 \uAD00\uB828 \uAE00\uC744 \uD568\uAED8 \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.";
    const boardTag = "book";
    let currentSub = ctx.sub || null;
    let pageNum = 1;
    let articleCounter = 0;
    let togglePage = false;
    let cachedList = null;
    function getCookie(name) {
      let cookieValue = null;
      if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i += 1) {
          const cookie = cookies[i].trim();
          if (cookie.substring(0, name.length + 1) === `${name}=`) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }
      return cookieValue;
    }
    function Div_box_header(props) {
      return /* @__PURE__ */ React.createElement("p", { class: "flex flex-row text-start w-full font-extrabold underline" }, props.title);
    }
    function Div_book_content_skeleton() {
      return /* @__PURE__ */ React.createElement("div", { class: "flex flex-row justify-center items-center w-full h-[260px] bg-gray-300 rounded-xl animate-pulse" });
    }
    function Div_article_list_skeleton() {
      return /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center w-full space-y-2 animate-pulse" }, /* @__PURE__ */ React.createElement("div", { class: "h-5 bg-gray-200 rounded-full w-full" }), /* @__PURE__ */ React.createElement("div", { class: "h-5 bg-gray-200 rounded-full w-full" }), /* @__PURE__ */ React.createElement("div", { class: "h-5 bg-gray-200 rounded-full w-full" }), /* @__PURE__ */ React.createElement("div", { class: "h-5 bg-gray-200 rounded-full w-full" }), /* @__PURE__ */ React.createElement("div", { class: "h-5 bg-gray-200 rounded-full w-full" }));
    }
    const classSpanBtnDefault = "flex flex-row justify-center items-center w-fit h-[20px] px-1.5 rounded-xl";
    function Span_btn_user(props) {
      const roleClassMap = {
        "\uAD00\uB9AC\uC790": "bg-yellow-100 text-yellow-800",
        "\uAE30\uC5C5\uD68C\uC6D0": "bg-red-100 text-red-800",
        "VIP\uD68C\uC6D0": "bg-blue-100 text-blue-800",
        "\uC815\uD68C\uC6D0": "bg-green-100 text-green-800",
        "\uC900\uD68C\uC6D0": "bg-gray-100 text-gray-800"
      };
      const roleClass = roleClassMap[props.role] || "bg-gray-100 text-gray-800";
      return /* @__PURE__ */ React.createElement("span", { class: `${classSpanBtnDefault} text-xs ${roleClass}` }, /* @__PURE__ */ React.createElement("img", { src: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/board_user.svg", class: "w-3 h-3 mr-1" }), props.user_nickname);
    }
    function Span_btn_date(props) {
      var _a;
      return /* @__PURE__ */ React.createElement("span", { class: `${classSpanBtnDefault} text-xs bg-blue-100 text-blue-800` }, /* @__PURE__ */ React.createElement("img", { src: `https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/calendar_${Number(((_a = (props.date || "").split("-")[2]) == null ? void 0 : _a.substr(0, 2)) || "1")}.svg`, class: "w-3 h-3 mr-1" }), props.date);
    }
    function Span_btn_article_read(props) {
      return props.cnt_read > 0 ? /* @__PURE__ */ React.createElement("span", { class: `${classSpanBtnDefault} text-xs bg-gray-100 text-blue-800` }, /* @__PURE__ */ React.createElement("img", { src: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/eye.svg", class: "w-3 h-3 mr-1" }), String(props.cnt_read).replace(/\B(?=(\d{3})+(?!\d))/g, ",")) : null;
    }
    function Span_btn_article_comment(props) {
      return props.cnt_comment > 0 ? /* @__PURE__ */ React.createElement("span", { class: `${classSpanBtnDefault} text-xs bg-purple-100 text-blue-800` }, /* @__PURE__ */ React.createElement("img", { src: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/comment.svg", class: "w-3 h-3 mr-1" }), String(props.cnt_comment).replace(/\B(?=(\d{3})+(?!\d))/g, ",")) : null;
    }
    function Span_btn_book(props) {
      return props.title ? /* @__PURE__ */ React.createElement("span", { class: `${classSpanBtnDefault} text-xs bg-green-100 text-green-800` }, /* @__PURE__ */ React.createElement("img", { src: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/book.svg", class: "w-3 h-3 mr-1" }), props.title) : null;
    }
    function Span_btn_article_new(props) {
      return props.toggle === 1 ? /* @__PURE__ */ React.createElement("span", { class: `${classSpanBtnDefault} text-[10px] bg-red-500 text-white animate-pulse` }, "NEW") : null;
    }
    function Span_btn_article_secret(props) {
      return props.toggle === 1 ? /* @__PURE__ */ React.createElement("span", { class: `${classSpanBtnDefault} text-[10px] bg-gray-500 text-white animate-pulse` }, "SECRET") : null;
    }
    function Span_btn_my_article(props) {
      return props.toggle === "writer" ? /* @__PURE__ */ React.createElement("span", { class: `${classSpanBtnDefault} text-[10px] bg-blue-500 text-white animate-pulse` }, "MY") : null;
    }
    function ArticleRow({ data }) {
      return /* @__PURE__ */ React.createElement("div", { class: "bg-white border-b w-full" }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-col px-6 py-4 space-y-1 cursor-pointer hover:bg-gray-100 w-full", onClick: () => location.href = `/book/read/${data.uuid}/` }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-row justify-start items-center space-x-2" }, /* @__PURE__ */ React.createElement("span", { class: "font-bold text-sm w-fit max-w-9/12 truncate ..." }, data.title), /* @__PURE__ */ React.createElement(Span_btn_article_new, { toggle: data.is_new }), /* @__PURE__ */ React.createElement(Span_btn_article_secret, { toggle: data.is_secret }), /* @__PURE__ */ React.createElement(Span_btn_my_article, { toggle: data.check_reader })), /* @__PURE__ */ React.createElement("div", { class: "flex flex-wrap justify-start items-center w-full space-x-2" }, /* @__PURE__ */ React.createElement(Span_btn_user, { user_nickname: data.user_nickname, role: data.user_role }), /* @__PURE__ */ React.createElement(Span_btn_date, { date: data.created_at }), /* @__PURE__ */ React.createElement(Span_btn_book, { title: data.category_sub_title }), /* @__PURE__ */ React.createElement(Span_btn_article_read, { cnt_read: data.cnt_read }), /* @__PURE__ */ React.createElement(Span_btn_article_comment, { cnt_comment: data.cnt_comment }))));
    }
    function BookCardScroller({ books, activeSub, onSelect }) {
      const activeCls = "flex flex-col justify-center items-center w-[175px] min-w-[175px] max-w-[175px] px-2 rounded-xl space-y-2 border border-gray-500 bg-blue-100 cursor-pointer hover:border hover:border-gray-900";
      const inactiveCls = "flex flex-col justify-center items-center w-[175px] min-w-[175px] max-w-[175px] px-2 rounded-xl space-y-2 cursor-pointer hover:border hover:border-gray-900";
      return /* @__PURE__ */ React.createElement("div", { class: "flex flex-col w-full h-fit border space-y-2 border-gray-300 rounded-xl p-4 mb-4 relative" }, /* @__PURE__ */ React.createElement("p", { class: "font-extrabold underline" }, "\uB3C4\uC11C \uC120\uD0DD"), /* @__PURE__ */ React.createElement("div", { class: "flex flex-nowrap space-x-8 overflow-x-scroll scroll-smooth scroll-hide", id: "div_book_list_slider" }, books.map((book) => /* @__PURE__ */ React.createElement("div", { key: book.uuid_board_category, class: activeSub === book.uuid_board_category ? activeCls : inactiveCls, onClick: () => onSelect(book.uuid_board_category) }, /* @__PURE__ */ React.createElement("img", { src: book.url_image, class: "w-[85px] min-w-[85px] max-w-[85px] h-[100px] min-h-[100px] max-h-[100px] object-cover rounded" }), /* @__PURE__ */ React.createElement("p", { class: "text-sm text-center" }, book.title))), /* @__PURE__ */ React.createElement("div", { id: "div_book_list_prev", class: "absolute top-[110px] left-[8px] z-10 cursor-pointer hover:rounded-full hover:text-blue-700 focus:z-10 focus:ring-8 focus:ring-gray-200" }, /* @__PURE__ */ React.createElement("img", { src: "https://cdn.jsdelivr.net/gh/Ignite-Official/CDN/web/image/svg/main_scroll_left.svg", class: "w-[36px] h-[36px]" })), /* @__PURE__ */ React.createElement("div", { id: "div_book_list_next", class: "absolute top-[110px] right-[8px] z-10 cursor-pointer hover:rounded-full hover:text-blue-700 focus:z-10 focus:ring-8 focus:ring-gray-200" }, /* @__PURE__ */ React.createElement("img", { src: "https://cdn.jsdelivr.net/gh/Ignite-Official/CDN/web/image/svg/main_scroll_right.svg", class: "w-[36px] h-[36px]" }))));
    }
    function MarketButtons({ stores }) {
      if (!stores || stores.length === 0)
        return null;
      const isAffiliateLink = window.WebRBookIsCuratedAffiliateLink;
      return /* @__PURE__ */ React.createElement("div", { class: "w-full" }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-wrap gap-2 w-full" }, stores.map((store) => /* @__PURE__ */ React.createElement(
        "a",
        {
          key: store.name,
          href: store.link,
          target: "_blank",
          rel: isAffiliateLink(store.link) ? "nofollow sponsored noreferrer noopener" : "noreferrer noopener",
          class: "text-gray-700 bg-gray-100 border border-gray-300 rounded-lg text-sm px-4 py-2 hover:bg-gray-200"
        },
        store.name
      ))), stores.some((store) => isAffiliateLink(store.link)) ? /* @__PURE__ */ React.createElement("p", { class: "mt-2 text-xs text-gray-500" }, "이 링크를 통해 구매하면 수수료를 제공받을 수 있습니다.") : null);
    }
    function BookInfoPanel({ bookData, stores, curatedCatalog = false }) {
      if (!bookData) {
        return /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center w-full space-y-4 text-center" }, /* @__PURE__ */ React.createElement("p", { class: "text-gray-600" }, "\uB3C4\uC11C\uB97C \uC120\uD0DD\uD558\uBA74 \uCC45 \uC815\uBCF4\uC640 \uAD00\uB828 \uAE00\uC744 \uD568\uAED8 \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4."), curatedCatalog ? null : /* @__PURE__ */ React.createElement("a", { href: "/book/write/", class: "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center w-full hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300" }, "\uAE00\uC4F0\uAE30"));
      }
      return /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center w-full space-y-4" }, /* @__PURE__ */ React.createElement("a", { href: `/book/${bookData.uuid_board_category}/`, class: "w-full flex justify-center" }, /* @__PURE__ */ React.createElement("img", { src: bookData.url_image, class: "w-[140px] min-w-[140px] max-w-[140px] border border-gray-300 rounded-lg" })), /* @__PURE__ */ React.createElement("div", { class: "text-center space-y-1" }, /* @__PURE__ */ React.createElement("p", { class: "text-md font-extrabold" }, bookData.title), /* @__PURE__ */ React.createElement("p", { class: "text-sm font-normal text-gray-600" }, [bookData.publisher, bookData.published_at].filter(Boolean).join(" | ")), bookData.page_cnt ? /* @__PURE__ */ React.createElement("p", { class: "text-xs text-gray-500" }, bookData.page_cnt, " pages") : null), curatedCatalog || bookData.content_format === "plain_text" ? null : /* @__PURE__ */ React.createElement("a", { href: `/book/write/${bookData.uuid_board_category}/`, class: "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center w-full hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300" }, "\uC774 \uCC45\uC73C\uB85C \uAE00\uC4F0\uAE30"), /* @__PURE__ */ React.createElement(MarketButtons, { stores }));
    }
    function Shell() {
      return /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center py-8 px-4 w-full max-w-screen-xl mx-auto md:px-8" }, /* @__PURE__ */ React.createElement(Div_page_header, { title: header_title, subtitle: header_subtitle }), /* @__PURE__ */ React.createElement("div", { class: "w-full", id: "div_book_list" }, /* @__PURE__ */ React.createElement("div", { class: "flex flex-row justify-center items-center w-full h-[150px] mb-4 bg-gray-300 rounded-xl animate-pulse" })), /* @__PURE__ */ React.createElement("div", { class: "grid grid-cols-1 lg:grid-cols-4 w-full gap-4" }, /* @__PURE__ */ React.createElement("div", { class: "col-span-1 w-full", id: "div_book_info" }, /* @__PURE__ */ React.createElement(Div_book_content_skeleton, null)), /* @__PURE__ */ React.createElement("div", { class: "col-span-1 lg:col-span-3 w-full", id: "div_article_list" }, /* @__PURE__ */ React.createElement(Div_article_list_skeleton, null))));
    }
    async function ensureBookList() {
      if (cachedList)
        return cachedList;
      const data = await fetch("/book/ajax_get_book_list/", { method: "POST" }).then((res) => res.json());
      const deduped = [...new Map(Object.values(data || {}).map((item) => [item.uuid_board_category, item])).values()];
      cachedList = { raw: Object.values(data || {}), books: deduped };
      return cachedList;
    }
    async function renderBookCards() {
      const listData = await ensureBookList();
      ReactDOM.render(/* @__PURE__ */ React.createElement(BookCardScroller, { books: listData.books, activeSub: currentSub, onSelect: handleSelectBook }), document.getElementById("div_book_list"));
      const slider = document.getElementById("div_book_list_slider");
      const prev = document.getElementById("div_book_list_prev");
      const next = document.getElementById("div_book_list_next");
      if (slider && prev && next) {
        next.onclick = () => slider.scrollBy(slider.offsetWidth, 0);
        prev.onclick = () => slider.scrollBy(-slider.offsetWidth, 0);
      }
    }
    async function renderBookInfo() {
      const listData = await ensureBookList();
      const curatedCatalog = listData.books.length > 0 && listData.books.every((book) => book.content_format === "plain_text");
      if (!currentSub) {
        ReactDOM.render(/* @__PURE__ */ React.createElement(BookInfoPanel, { bookData: null, stores: [], curatedCatalog }), document.getElementById("div_book_info"));
        return;
      }
      const requestData = new FormData();
      requestData.append("tag_sub", currentSub || "null");
      const bookData = await fetch("/book/ajax_get_book_info/", {
        method: "post",
        headers: { "X-CSRFToken": getCookie("csrftoken") },
        body: requestData
      }).then((res) => res.json());
      const curatedBook = bookData && bookData.content_format === "plain_text";
      const stores = window.WebRBookSafeStores(curatedBook ? bookData.links : listData.raw.filter((item) => item.uuid_board_category === currentSub), curatedBook);
      ReactDOM.render(/* @__PURE__ */ React.createElement(BookInfoPanel, { bookData, stores, curatedCatalog }), document.getElementById("div_book_info"));
    }
    function renderArticleList(data, mode) {
      const items = Object.values(data || {}).map((item) => /* @__PURE__ */ React.createElement(ArticleRow, { key: item.uuid, data: item }));
      const container = /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center border border-gray-300 rounded-xl space-y-4 w-full p-8" }, /* @__PURE__ */ React.createElement(Div_box_header, { title: currentSub ? "\uAD00\uB828 \uAE00" : "\uC804\uCCB4 \uB3C4\uC11C \uAE00" }), /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-start w-full space-y-2" }, items, /* @__PURE__ */ React.createElement("div", { id: `div_article_list_${pageNum + 1}`, class: "w-full" })));
      const nextContainer = /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-start w-full space-y-2" }, items, /* @__PURE__ */ React.createElement("div", { id: `div_article_list_${pageNum + 1}`, class: "w-full" }));
      const targetId = mode === "next" ? `div_article_list_${pageNum}` : "div_article_list";
      ReactDOM.render(mode === "next" ? nextContainer : container, document.getElementById(targetId));
    }
    async function getArticleList(mode) {
      var _a;
      if (togglePage)
        return;
      togglePage = true;
      const requestData = new FormData();
      requestData.append("tag", boardTag);
      requestData.append("tag_sub", currentSub || "null");
      if (mode === "init") {
        pageNum = 1;
        ReactDOM.render(/* @__PURE__ */ React.createElement(Div_article_list_skeleton, null), document.getElementById("div_article_list"));
      } else {
        pageNum += 1;
        const nextTarget = document.getElementById(`div_article_list_${pageNum}`);
        if (nextTarget)
          ReactDOM.render(/* @__PURE__ */ React.createElement(Div_article_list_skeleton, null), nextTarget);
      }
      requestData.append("page", pageNum);
      const data = await fetch("/blank/ajax_board/get_article_list/", {
        method: "post",
        headers: { "X-CSRFToken": getCookie("csrftoken") },
        body: requestData
      }).then((res) => res.json());
      articleCounter = Number(((_a = data == null ? void 0 : data.count) == null ? void 0 : _a.cnt) || 0);
      renderArticleList((data == null ? void 0 : data.list) || {}, mode);
      togglePage = false;
    }
    async function handleSelectBook(nextSub) {
      currentSub = currentSub === nextSub ? null : nextSub;
      await renderBookCards();
      await renderBookInfo();
      await getArticleList("init");
    }
    function bindInfiniteScroll() {
      if (window.__webrBookListScrollBound)
        return;
      window.__webrBookListScrollBound = true;
      window.addEventListener("scroll", () => {
        const isScrollEnded = window.innerHeight + window.scrollY + 1 >= document.body.offsetHeight;
        if (isScrollEnded && !togglePage && pageNum * 20 < articleCounter) {
          getArticleList("next");
        }
      });
    }
    if (!root)
      return;
    ReactDOM.render(/* @__PURE__ */ React.createElement(Shell, null), root);
    await renderBookCards();
    await renderBookInfo();
    await getArticleList("init");
    bindInfiniteScroll();
  };
})();
(function() {
  window.WebRBookPages = window.WebRBookPages || {};
  window.WebRBookPages.write = async function set_main_write() {
    const ctx = window.WebRBookRouteContext || {};
    const root = document.getElementById("div_main");
    const preselectedSub = ctx.sub || "";
    const initUrl = "/book/";
    let toggleClickSubmit = false;
    let editor = null;
    let bookOptions = [];
    function getCookie(name) {
      let cookieValue = null;
      if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i += 1) {
          const cookie = cookies[i].trim();
          if (cookie.substring(0, name.length + 1) === `${name}=`) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }
      return cookieValue;
    }
    function Div_button() {
      return /* @__PURE__ */ React.createElement("div", { class: "grid grid-cols-2 justify-center items-center gap-2 w-full" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => click_btn_submit(), class: "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center w-full hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300" }, "\uC644\uB8CC"), /* @__PURE__ */ React.createElement("a", { href: initUrl, class: "text-gray-900 text-center bg-white border border-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100" }, "\uBAA9\uB85D\uC73C\uB85C"));
    }
    function Div_button_loading() {
      return /* @__PURE__ */ React.createElement("div", { class: "grid grid-cols-2 justify-center items-center gap-2 w-full" }, /* @__PURE__ */ React.createElement("button", { type: "button", class: "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center w-full cursor-not-allowed" }, /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", role: "status", class: "inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600", viewBox: "0 0 100 101", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ React.createElement("path", { d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z", fill: "currentColor" }), /* @__PURE__ */ React.createElement("path", { d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z", fill: "#1C64F2" })), "\uC644\uB8CC"), /* @__PURE__ */ React.createElement("button", { type: "button", class: "text-gray-900 bg-white border border-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 cursor-not-allowed" }, "\uBAA9\uB85D\uC73C\uB85C"));
    }
    function Form() {
      return /* @__PURE__ */ React.createElement("div", { class: "max-w-screen-xl px-6 py-8 mx-auto space-y-4" }, /* @__PURE__ */ React.createElement(Div_page_header, { title: "\uB3C4\uC11C \uAE00\uC4F0\uAE30", subtitle: "\uB3C4\uC11C\uBCC4 \uAE00\uC744 \uB4F1\uB85D\uD569\uB2C8\uB2E4." }), /* @__PURE__ */ React.createElement("div", { id: "div_title", class: "w-full" }, /* @__PURE__ */ React.createElement("input", { type: "text", placeholder: "\uC81C\uBAA9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.", id: "txt_title", name: "txt_title", class: "w-full h-[48px] rounded-lg resize-none scroll-hide text-start text-[14px] font-[500] border-gray-500 focus:ring-gray-700 focus:border-gray-700" })), /* @__PURE__ */ React.createElement("div", { id: "div_sel_book", class: "flex flex-row justify-end items-center w-full" }, /* @__PURE__ */ React.createElement("div", { class: "flex items-center justify-center w-full h-12 bg-gray-300 rounded animate-pulse" })), /* @__PURE__ */ React.createElement("div", { id: "div_checker", class: "flex flex-row justify-end items-center w-full" }, /* @__PURE__ */ React.createElement("div", { class: "flex items-center mb-4" }, /* @__PURE__ */ React.createElement("input", { id: "chk_secret", type: "checkbox", value: "", class: "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" }), /* @__PURE__ */ React.createElement("label", { for: "chk_secret", class: "ms-2 text-sm font-medium text-gray-900" }, "\uBE44\uBC00\uAE00\uB85C \uC791\uC131\uD558\uAE30 (\uBCF8\uC778\uACFC \uAD00\uB9AC\uC790\uB9CC \uC77D\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.)"))), /* @__PURE__ */ React.createElement("div", { id: "div_editor", class: "w-full" }), /* @__PURE__ */ React.createElement("div", { class: "w-full", id: "div_button_list" }, /* @__PURE__ */ React.createElement(Div_button, null)));
    }
    function BookSelect({ options, selectedSub }) {
      return /* @__PURE__ */ React.createElement("form", { class: "w-full" }, /* @__PURE__ */ React.createElement("select", { id: "sel_book", class: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500", defaultValue: selectedSub || "" }, /* @__PURE__ */ React.createElement("option", { value: "" }, "\uC5B4\uB5A4 \uCC45\uC5D0 \uAD00\uD574 \uC774\uC57C\uAE30 \uD558\uC2E4\uAC74\uAC00\uC694?"), options.map((item) => /* @__PURE__ */ React.createElement("option", { key: item.uuid_board_category, value: item.uuid }, item.title))));
    }
    async function loadBookOptions() {
      const data = await fetch("/book/ajax_get_book_list/", { method: "POST" }).then((res) => res.json());
      bookOptions = [...new Map(Object.values(data || {}).map((item) => [item.uuid_board_category, item])).values()];
      const selected = bookOptions.find((item) => item.uuid_board_category === preselectedSub);
      ReactDOM.render(/* @__PURE__ */ React.createElement(BookSelect, { options: bookOptions, selectedSub: selected ? selected.uuid : "" }), document.getElementById("div_sel_book"));
    }
    async function click_btn_submit() {
      const txtTitle = document.getElementById("txt_title").value.trim();
      const selBook = document.getElementById("sel_book").value;
      const txtContent = editor.getHTML();
      const chkSecret = document.getElementById("chk_secret").checked;
      if (toggleClickSubmit)
        return;
      toggleClickSubmit = true;
      ReactDOM.render(/* @__PURE__ */ React.createElement(Div_button_loading, null), document.getElementById("div_button_list"));
      try {
        if (!txtTitle) {
          alert("\uC81C\uBAA9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
          return;
        }
        if (!selBook) {
          alert("\uB3C4\uC11C\uB97C \uC120\uD0DD\uD574\uC8FC\uC138\uC694.");
          return;
        }
        if (!txtContent || txtContent === "<p><br></p>") {
          alert("\uB0B4\uC6A9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
          return;
        }
        const requestData = new FormData();
        requestData.append("tag", selBook);
        requestData.append("txt_title", txtTitle);
        requestData.append("txt_content", txtContent);
        requestData.append("chk_secret", chkSecret);
        const data = await fetch("/book/ajax_insert_article/", {
          method: "post",
          headers: { "X-CSRFToken": getCookie("csrftoken") },
          body: requestData
        }).then((res) => res.json());
        location.href = `${initUrl}read/${data.uuid}/`;
      } finally {
        toggleClickSubmit = false;
        ReactDOM.render(/* @__PURE__ */ React.createElement(Div_button, null), document.getElementById("div_button_list"));
      }
    }
    if (!root)
      return;
    if ((window.gv_username || "") === "") {
      location.href = preselectedSub ? `/book/${preselectedSub}/` : initUrl;
      return;
    }
    ReactDOM.render(/* @__PURE__ */ React.createElement(Form, null), root);
editor = WebRSolidEdit.mountEditor(document.querySelector("#div_editor"), { height: "500px", placeholder: "내용을 입력해주세요." });
    await loadBookOptions();
  };
})();
(function() {
  window.WebRBookPages = window.WebRBookPages || {};
  window.WebRBookPages.edit = async function set_main_edit() {
    var _a, _b, _c, _d;
    const ctx = window.WebRBookRouteContext || {};
    const root = document.getElementById("div_main");
    const orderID = ctx.orderID || "";
    const initUrl = "/book/";
    let toggleClickSubmit = false;
    let editor = null;
    let articleData = null;
    let bookOptions = [];
    function getCookie(name) {
      let cookieValue = null;
      if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i += 1) {
          const cookie = cookies[i].trim();
          if (cookie.substring(0, name.length + 1) === `${name}=`) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }
      return cookieValue;
    }
    function Div_button() {
      return /* @__PURE__ */ React.createElement("div", { class: "grid grid-cols-2 justify-center items-center gap-2 w-full" }, /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => click_btn_submit(), class: "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center w-full hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300" }, "\uC644\uB8CC"), /* @__PURE__ */ React.createElement("a", { href: initUrl, class: "text-gray-900 text-center bg-white border border-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100" }, "\uBAA9\uB85D\uC73C\uB85C"));
    }
    function Div_button_loading() {
      return /* @__PURE__ */ React.createElement("div", { class: "grid grid-cols-2 justify-center items-center gap-2 w-full" }, /* @__PURE__ */ React.createElement("button", { type: "button", class: "text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center w-full cursor-not-allowed" }, "\uC644\uB8CC"), /* @__PURE__ */ React.createElement("button", { type: "button", class: "text-gray-900 bg-white border border-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 cursor-not-allowed" }, "\uBAA9\uB85D\uC73C\uB85C"));
    }
    function Div_check_writer() {
      return /* @__PURE__ */ React.createElement("div", { class: "max-w-screen-xl px-6 py-8 mx-auto space-y-4" }, /* @__PURE__ */ React.createElement(Div_page_header, { title: "\uB3C4\uC11C \uAE00 \uC218\uC815", subtitle: "\uC791\uC131\uC790 \uC5EC\uBD80\uB97C \uD655\uC778\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4." }), /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center w-full space-y-4" }, /* @__PURE__ */ React.createElement("svg", { "aria-hidden": "true", class: "w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600", viewBox: "0 0 100 101", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ React.createElement("path", { d: "M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z", fill: "currentColor" }), /* @__PURE__ */ React.createElement("path", { d: "M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z", fill: "currentFill" })), /* @__PURE__ */ React.createElement("p", null, "\uC791\uC131\uC790 \uC5EC\uBD80\uB97C \uD655\uC778\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.")));
    }
    function Div_main_stop() {
      return /* @__PURE__ */ React.createElement("div", { class: "max-w-screen-xl px-6 py-8 mx-auto space-y-4" }, /* @__PURE__ */ React.createElement(Div_page_header, { title: "\uB3C4\uC11C \uAE00 \uC218\uC815", subtitle: "\uC791\uC131\uC790\uB9CC \uC218\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." }), /* @__PURE__ */ React.createElement("div", { class: "flex flex-col justify-center items-center w-full space-y-4" }, /* @__PURE__ */ React.createElement("img", { src: "https://cdn.jsdelivr.net/gh/statground/web-R_CDN@f3e464e95616fa13712baa6adbbb0b6cda7ee821/images/svg/stop.svg", class: "size-16" }), /* @__PURE__ */ React.createElement("p", null, "\uC791\uC131\uC790\uB9CC \uAE00\uC744 \uC218\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."), /* @__PURE__ */ React.createElement("a", { href: initUrl, class: "text-gray-900 text-center bg-white border border-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 w-[150px] focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100" }, "\uBAA9\uB85D\uC73C\uB85C")));
    }
    function Form() {
      return /* @__PURE__ */ React.createElement("div", { class: "max-w-screen-xl px-6 py-8 mx-auto space-y-4" }, /* @__PURE__ */ React.createElement(Div_page_header, { title: "\uB3C4\uC11C \uAE00 \uC218\uC815", subtitle: "\uB3C4\uC11C \uAE00 \uB0B4\uC6A9\uC744 \uC218\uC815\uD569\uB2C8\uB2E4." }), /* @__PURE__ */ React.createElement("div", { id: "div_title", class: "w-full" }, /* @__PURE__ */ React.createElement("input", { type: "text", placeholder: "\uC81C\uBAA9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.", id: "txt_title", name: "txt_title", class: "w-full h-[48px] rounded-lg resize-none scroll-hide text-start text-[14px] font-[500] border-gray-500 focus:ring-gray-700 focus:border-gray-700" })), /* @__PURE__ */ React.createElement("div", { id: "div_sel_book", class: "flex flex-row justify-end items-center w-full" }, /* @__PURE__ */ React.createElement("div", { class: "flex items-center justify-center w-full h-12 bg-gray-300 rounded animate-pulse" })), /* @__PURE__ */ React.createElement("div", { id: "div_checker", class: "flex flex-row justify-end items-center w-full" }, /* @__PURE__ */ React.createElement("div", { class: "flex items-center mb-4" }, /* @__PURE__ */ React.createElement("input", { id: "chk_secret", type: "checkbox", value: "", class: "w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" }), /* @__PURE__ */ React.createElement("label", { for: "chk_secret", class: "ms-2 text-sm font-medium text-gray-900" }, "\uBE44\uBC00\uAE00\uB85C \uC791\uC131\uD558\uAE30 (\uBCF8\uC778\uACFC \uAD00\uB9AC\uC790\uB9CC \uC77D\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.)"))), /* @__PURE__ */ React.createElement("div", { id: "div_editor", class: "w-full" }), /* @__PURE__ */ React.createElement("div", { class: "w-full", id: "div_button_list" }, /* @__PURE__ */ React.createElement(Div_button, null)));
    }
    function BookSelect({ options, selectedCategoryUUID }) {
      const selected = options.find((item) => item.uuid_board_category === selectedCategoryUUID);
      return /* @__PURE__ */ React.createElement("form", { class: "w-full" }, /* @__PURE__ */ React.createElement("select", { id: "sel_book", class: "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500", defaultValue: selected ? selected.uuid : "" }, options.map((item) => /* @__PURE__ */ React.createElement("option", { key: item.uuid_board_category, value: item.uuid }, item.title))));
    }
    async function loadBookOptions() {
      var _a2;
      const data = await fetch("/book/ajax_get_book_list/", { method: "POST" }).then((res) => res.json());
      bookOptions = [...new Map(Object.values(data || {}).map((item) => [item.uuid_board_category, item])).values()];
      ReactDOM.render(/* @__PURE__ */ React.createElement(BookSelect, { options: bookOptions, selectedCategoryUUID: (_a2 = articleData == null ? void 0 : articleData.article) == null ? void 0 : _a2.category_uuid }), document.getElementById("div_sel_book"));
    }
    async function click_btn_submit() {
      const txtTitle = document.getElementById("txt_title").value.trim();
      const selBook = document.getElementById("sel_book").value;
      const txtContent = editor.getHTML();
      const chkSecret = document.getElementById("chk_secret").checked;
      if (toggleClickSubmit)
        return;
      toggleClickSubmit = true;
      ReactDOM.render(/* @__PURE__ */ React.createElement(Div_button_loading, null), document.getElementById("div_button_list"));
      try {
        if (!txtTitle) {
          alert("\uC81C\uBAA9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
          return;
        }
        if (!txtContent || txtContent === "<p><br></p>") {
          alert("\uB0B4\uC6A9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
          return;
        }
        const requestData2 = new FormData();
        requestData2.append("tag", selBook);
        requestData2.append("uuid_article", orderID);
        requestData2.append("txt_title", txtTitle);
        requestData2.append("txt_content", txtContent);
        requestData2.append("chk_secret", chkSecret);
        const data = await fetch("/book/ajax_update_article/", {
          method: "post",
          headers: { "X-CSRFToken": getCookie("csrftoken") },
          body: requestData2
        }).then((res) => res.json());
        location.href = `${initUrl}read/${data.uuid}/`;
      } finally {
        toggleClickSubmit = false;
        ReactDOM.render(/* @__PURE__ */ React.createElement(Div_button, null), document.getElementById("div_button_list"));
      }
    }
    if (!root)
      return;
    if ((window.gv_username || "") === "" || !orderID) {
      location.href = initUrl;
      return;
    }
    ReactDOM.render(/* @__PURE__ */ React.createElement(Div_check_writer, null), root);
    const requestData = new FormData();
    requestData.append("orderID", orderID);
    articleData = await fetch("/blank/ajax_board/get_read_article/", {
      method: "post",
      headers: { "X-CSRFToken": getCookie("csrftoken") },
      body: requestData
    }).then((res) => res.json());
    if (((_a = articleData == null ? void 0 : articleData.article) == null ? void 0 : _a.check_reader) === "user") {
      ReactDOM.render(/* @__PURE__ */ React.createElement(Div_main_stop, null), root);
      return;
    }
    ReactDOM.render(/* @__PURE__ */ React.createElement(Form, null), root);
editor = WebRSolidEdit.mountEditor(document.querySelector("#div_editor"), { height: "500px", placeholder: "내용을 입력해주세요." });
    document.getElementById("txt_title").value = ((_b = articleData == null ? void 0 : articleData.article) == null ? void 0 : _b.title) || "";
    editor.setHTML(((_c = articleData == null ? void 0 : articleData.article) == null ? void 0 : _c.content) || "");
    if (((_d = articleData == null ? void 0 : articleData.article) == null ? void 0 : _d.is_secret) === 1) {
      document.getElementById("chk_secret").checked = true;
    }
    await loadBookOptions();
  };
})();
(function() {
  window.WebRBookPages = window.WebRBookPages || {};
  window.WebRBookPages.read = async function set_main_read_stub() {
    const root = document.getElementById("div_main");
    if (!root)
      return;
    ReactDOM.render(
      /* @__PURE__ */ React.createElement("div", { class: "max-w-screen-xl mx-auto px-6 py-8 text-gray-600" }, "/book/read/ \uAE00 \uC77D\uAE30 \uD654\uBA74\uC740 \uACF5\uC6A9 board/read \uD750\uB984\uC744 \uC0AC\uC6A9\uD558\uBBC0\uB85C \uC774 \uD15C\uD50C\uB9BF\uC758 book set_main \uB77C\uC6B0\uD130 \uB300\uC0C1\uC774 \uC544\uB2D9\uB2C8\uB2E4."),
      root
    );
  };
})();
(function() {
  window.set_main = async function set_main() {
    const ctx = window.WebRBookRouteContext || {};
    const pages = window.WebRBookPages || {};
    const pageMain = pages[ctx.route] || pages.detail;
    if (typeof pageMain === "function") {
      await pageMain();
      return;
    }
    const root = document.getElementById("div_main");
    if (root) {
      ReactDOM.render(
        /* @__PURE__ */ React.createElement("div", { class: "max-w-screen-xl mx-auto px-6 py-8 text-red-600" }, "book set_main router error"),
        root
      );
    }
  };
})();
