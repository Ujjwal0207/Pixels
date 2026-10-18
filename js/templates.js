/**
 * Templates Engine for DesignPro
 * Pre-designed, fully editable, high-impact design templates
 * Across Social Media, Marketing, YouTube, Business, Events, and Presentations
 */

class TemplatesEngine {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  loadTemplate(templateKey) {
    if (this.canvasManager) this.canvasManager.isBatchLoading = true;
    this.canvas.clear();
    const w = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
    const h = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));
    const cx = w / 2;
    const cy = h / 2;

    switch (templateKey) {
      case 'flash-sale':
        this.renderFlashSale(w, h, cx, cy);
        break;
      case 'ai-summit':
        this.renderAISummit(w, h, cx, cy);
        break;
      case 'inspirational-quote':
        this.renderInspirationalQuote(w, h, cx, cy);
        break;
      case 'summer-festival':
        this.renderSummerFestival(w, h, cx, cy);
        break;
      case 'artisan-coffee':
        this.renderArtisanCoffee(w, h, cx, cy);
        break;
      case 'fitness-challenge':
        this.renderFitnessChallenge(w, h, cx, cy);
        break;
      case 'youtube-review':
        this.canvasManager.setArtboardSize(1280, 720);
        this.renderYouTubeReview(1280, 720, 640, 360);
        break;
      case 'business-card':
        this.canvasManager.setArtboardSize(1050, 600);
        this.renderBusinessCard(1050, 600, 525, 300);
        break;
      case 'pitch-deck':
        this.canvasManager.setArtboardSize(1920, 1080);
        this.renderPitchDeck(1920, 1080, 960, 540);
        break;
      case 'travel-story':
        this.canvasManager.setArtboardSize(1080, 1920);
        this.renderTravelStory(1080, 1920, 540, 960);
        break;
      case 'creative-resume':
        this.canvasManager.setArtboardSize(800, 1200);
        this.renderCreativeResume(800, 1200, 400, 600);
        break;
      case 'award-certificate':
        this.canvasManager.setArtboardSize(1920, 1080);
        this.renderAwardCertificate(1920, 1080, 960, 540);
        break;
      case 'podcast-cover':
        this.canvasManager.setArtboardSize(1080, 1080);
        this.renderPodcastCover(1080, 1080, 540, 540);
        break;
      case 'real-estate':
        this.canvasManager.setArtboardSize(1080, 1080);
        this.renderRealEstate(1080, 1080, 540, 540);
        break;
      case 'wedding-invitation':
        this.canvasManager.setArtboardSize(1080, 1920);
        this.renderWeddingInvitation(1080, 1920, 540, 960);
        break;
      case 'ebook-cover':
        this.canvasManager.setArtboardSize(1080, 1440);
        this.renderEbookCover(1080, 1440, 540, 720);
        break;
      case 'brand-invoice':
        this.canvasManager.setArtboardSize(1200, 1600);
        this.renderBrandInvoice(1200, 1600, 600, 800);
        break;
      case 'product-launch':
        this.canvasManager.setArtboardSize(1920, 1080);
        this.renderProductLaunch(1920, 1080, 960, 540);
        break;
      default:
        this.renderFlashSale(w, h, cx, cy);
    }

    this.canvas.renderAll();
    if (this.canvasManager) this.canvasManager.isBatchLoading = false;
    this.canvasManager.recordState();
    if (window.app && window.app.layers) {
      window.app.layers.renderLayers();
    }
  }

  // 1. Mega Flash Sale (Marketing)
  renderFlashSale(w, h, cx, cy) {
    this.canvas.setBackgroundColor('#faf5ff', () => {});

    const glowCircle1 = new fabric.Circle({
      left: w * 0.85,
      top: h * 0.15,
      radius: 260,
      fill: 'rgba(236, 72, 153, 0.12)',
      originX: 'center',
      originY: 'center',
      name: 'Pink Glow',
    });

    const glowCircle2 = new fabric.Circle({
      left: w * 0.15,
      top: h * 0.85,
      radius: 280,
      fill: 'rgba(124, 58, 237, 0.12)',
      originX: 'center',
      originY: 'center',
      name: 'Violet Glow',
    });

    const tag = new fabric.IText('SEASON FINALE EVENT', {
      left: cx,
      top: cy - 230,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 20,
      fontWeight: '800',
      fill: '#7c3aed',
      charSpacing: 220,
      name: 'Event Tag',
    });

    const title = new fabric.IText('BIG FLASH\nSALE', {
      left: cx,
      top: cy - 100,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Outfit',
      fontSize: 104,
      fontWeight: '900',
      fill: '#0f172a',
      textAlign: 'center',
      lineHeight: 0.9,
      charSpacing: -30,
      name: 'Main Title',
    });

    const ribbon = new fabric.Rect({
      left: cx,
      top: cy + 50,
      originX: 'center',
      originY: 'center',
      width: 480,
      height: 70,
      rx: 16,
      ry: 16,
      fill: '#7c3aed',
      shadow: new fabric.Shadow({
        color: 'rgba(124, 58, 237, 0.3)',
        blur: 20,
        offsetX: 0,
        offsetY: 4,
      }),
      name: 'Discount Card',
    });

    const discountText = new fabric.IText('UP TO 70% OFF EVERYTHING', {
      left: cx,
      top: cy + 50,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Outfit',
      fontSize: 26,
      fontWeight: '800',
      fill: '#ffffff',
      charSpacing: 20,
      name: 'Discount Text',
    });

    const sub = new fabric.IText('Limited Stock Available • Free Express Shipping Over $50', {
      left: cx,
      top: cy + 130,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 19,
      fontWeight: '500',
      fill: '#475569',
      name: 'Subtitle',
    });

    const btn = new fabric.Rect({
      left: cx,
      top: cy + 220,
      originX: 'center',
      originY: 'center',
      width: 280,
      height: 60,
      rx: 30,
      ry: 30,
      fill: '#0f172a',
      name: 'Button Background',
    });

    const btnText = new fabric.IText('SHOP NOW →', {
      left: cx,
      top: cy + 220,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Outfit',
      fontSize: 22,
      fontWeight: 'bold',
      fill: '#ffffff',
      name: 'Button Label',
    });

    this.canvas.add(glowCircle1, glowCircle2, tag, title, ribbon, discountText, sub, btn, btnText);
  }

  // 2. AI & Tech Summit (Tech & Events)
  renderAISummit(w, h, cx, cy) {
    this.canvas.setBackgroundColor('#f8fafc', () => {});

    const cardBg = new fabric.Rect({
      left: cx,
      top: cy,
      originX: 'center',
      originY: 'center',
      width: w - 80,
      height: h - 80,
      rx: 24,
      ry: 24,
      fill: '#ffffff',
      stroke: '#e2e8f0',
      strokeWidth: 2,
      shadow: new fabric.Shadow({
        color: 'rgba(15, 23, 42, 0.06)',
        blur: 24,
        offsetX: 0,
        offsetY: 8,
      }),
    });

    const neonBadge = new fabric.Rect({
      left: cx,
      top: cy - 220,
      originX: 'center',
      originY: 'center',
      width: 320,
      height: 38,
      rx: 19,
      ry: 19,
      stroke: '#0284c7',
      strokeWidth: 1.5,
      fill: '#e0f2fe',
      name: 'Summit Badge',
    });

    const badgeText = new fabric.IText('ANNUAL DEVELOPER SUMMIT', {
      left: cx,
      top: cy - 220,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Space Grotesk',
      fontSize: 14,
      fontWeight: '700',
      fill: '#0369a1',
      charSpacing: 140,
      name: 'Badge Text',
    });

    const title = new fabric.IText('AI & NEURAL\nHORIZONS 2026', {
      left: cx,
      top: cy - 80,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Space Grotesk',
      fontSize: 84,
      fontWeight: '900',
      fill: '#0f172a',
      textAlign: 'center',
      lineHeight: 0.95,
      name: 'Summit Title',
    });

    const sub = new fabric.IText('Exploring Autonomous Agents, Frontier Models & Quantum Compute', {
      left: cx,
      top: cy + 60,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 22,
      fontWeight: '500',
      fill: '#475569',
      name: 'Summit Sub',
    });

    const dateCard = new fabric.Rect({
      left: cx,
      top: cy + 180,
      originX: 'center',
      originY: 'center',
      width: 600,
      height: 90,
      rx: 16,
      ry: 16,
      fill: '#f1f5f9',
      stroke: '#cbd5e1',
      strokeWidth: 1,
      name: 'Date Box',
    });

    const dateText = new fabric.IText('OCTOBER 24-26, 2026 • SAN FRANCISCO & STREAMING', {
      left: cx,
      top: cy + 165,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Space Grotesk',
      fontSize: 18,
      fontWeight: '700',
      fill: '#0284c7',
      name: 'Date Text',
    });

    const keynoteText = new fabric.IText('Over 120+ Keynotes, Live Workshops & Hackathons', {
      left: cx,
      top: cy + 200,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 16,
      fill: '#64748b',
      name: 'Keynote Text',
    });

    this.canvas.add(cardBg, neonBadge, badgeText, title, sub, dateCard, dateText, keynoteText);
  }

  // 3. Inspirational Quote (Social & Mindfulness)
  renderInspirationalQuote(w, h, cx, cy) {
    this.canvas.setBackgroundColor('#faf7f2', () => {});

    const border = new fabric.Rect({
      left: cx,
      top: cy,
      originX: 'center',
      originY: 'center',
      width: w - 100,
      height: h - 100,
      fill: '#ffffff',
      stroke: '#d97706',
      strokeWidth: 2,
      shadow: new fabric.Shadow({
        color: 'rgba(217, 119, 6, 0.1)',
        blur: 20,
        offsetX: 0,
        offsetY: 6,
      }),
      name: 'Frame Border',
    });

    const innerBorder = new fabric.Rect({
      left: cx,
      top: cy,
      originX: 'center',
      originY: 'center',
      width: w - 140,
      height: h - 140,
      fill: 'transparent',
      stroke: '#e2e8f0',
      strokeWidth: 1,
      name: 'Inner Border',
    });

    const quoteMark = new fabric.IText('“', {
      left: cx,
      top: cy - 180,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Playfair Display',
      fontSize: 160,
      fontWeight: 'bold',
      fill: '#d97706',
      name: 'Quote Mark',
    });

    const quote = new fabric.IText('“Creativity is intelligence\nhaving fun.”', {
      left: cx,
      top: cy - 20,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Playfair Display',
      fontSize: 50,
      fontWeight: 'bold',
      fontStyle: 'italic',
      fill: '#1c1917',
      textAlign: 'center',
      lineHeight: 1.3,
      name: 'Quote Body',
    });

    const author = new fabric.IText('ALBERT EINSTEIN', {
      left: cx,
      top: cy + 140,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 18,
      fontWeight: '700',
      fill: '#b45309',
      charSpacing: 240,
      name: 'Author',
    });

    const divider = new fabric.Line([cx - 40, cy + 180, cx + 40, cy + 180], {
      stroke: '#d97706',
      strokeWidth: 2,
    });

    this.canvas.add(border, innerBorder, quoteMark, quote, author, divider);
  }

  // 4. Summer Music Festival (Events)
  renderSummerFestival(w, h, cx, cy) {
    this.canvas.setBackgroundColor('#fdf4ff', () => {});

    const sun = new fabric.Circle({
      left: cx,
      top: cy - 70,
      radius: 190,
      fill: '#fde047',
      originX: 'center',
      originY: 'center',
      name: 'Sunset Sun',
    });

    const tag = new fabric.IText('ANNUAL INDIE & ELECTRONIC GATHERING', {
      left: cx,
      top: cy - 280,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 18,
      fontWeight: '800',
      fill: '#9333ea',
      charSpacing: 180,
      name: 'Festival Header',
    });

    const title = new fabric.IText('NEON SUNSET\nFESTIVAL', {
      left: cx,
      top: cy - 60,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Bebas Neue',
      fontSize: 110,
      fill: '#1e1b4b',
      textAlign: 'center',
      lineHeight: 0.9,
      charSpacing: 40,
      name: 'Festival Title',
    });

    const info = new fabric.IText('LIVE STAGES • ART INSTALLATIONS • FOOD TRUCKS', {
      left: cx,
      top: cy + 120,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Outfit',
      fontSize: 20,
      fontWeight: '700',
      fill: '#db2777',
      charSpacing: 80,
      name: 'Features List',
    });

    const date = new fabric.IText('JULY 17 - 19, 2026 • PALM OASIS VALLEY', {
      left: cx,
      top: cy + 180,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 22,
      fontWeight: '600',
      fill: '#334155',
      name: 'Location Date',
    });

    const cta = new fabric.IText('EARLY BIRD PASSES ON SALE NOW', {
      left: cx,
      top: cy + 240,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 16,
      fontWeight: '800',
      fill: '#ea580c',
      charSpacing: 160,
      name: 'CTA',
    });

    this.canvas.add(sun, tag, title, info, date, cta);
  }

  // 5. Artisan Coffee & Bistro (Food & Cafe)
  renderArtisanCoffee(w, h, cx, cy) {
    this.canvas.setBackgroundColor('#fcfbf9', () => {});

    const border = new fabric.Rect({
      left: cx,
      top: cy,
      originX: 'center',
      originY: 'center',
      width: w - 120,
      height: h - 120,
      fill: '#ffffff',
      stroke: '#b45309',
      strokeWidth: 2,
      shadow: new fabric.Shadow({
        color: 'rgba(180, 83, 9, 0.08)',
        blur: 16,
        offsetX: 0,
        offsetY: 6,
      }),
    });

    const badge = new fabric.IText('EST. 2026', {
      left: cx,
      top: cy - 230,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 16,
      fontWeight: '700',
      fill: '#b45309',
      charSpacing: 180,
    });

    const title = new fabric.IText('VELVET & ROAST', {
      left: cx,
      top: cy - 140,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Cinzel',
      fontSize: 68,
      fontWeight: 'bold',
      fill: '#451a03',
      textAlign: 'center',
      charSpacing: 60,
    });

    const sub = new fabric.IText('SPECIALTY COFFEE & ARTISAN BAKERY', {
      left: cx,
      top: cy - 60,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 18,
      fontWeight: '600',
      fill: '#92400e',
      charSpacing: 160,
    });

    const body = new fabric.IText('Single origin beans roasted fresh every morning in small batches.\nPair your pour-over with our signature flaky butter croissants.', {
      left: cx,
      top: cy + 40,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 20,
      fill: '#57534e',
      textAlign: 'center',
      lineHeight: 1.4,
    });

    const offer = new fabric.IText('EVERY TUESDAY: BUY 1 GET 1 ON ALL ESPRESSO DRINKS', {
      left: cx,
      top: cy + 180,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Outfit',
      fontSize: 19,
      fontWeight: 'bold',
      fill: '#d97706',
    });

    this.canvas.add(border, badge, title, sub, body, offer);
  }

  // 6. Fitness Challenge (Health & Sports)
  renderFitnessChallenge(w, h, cx, cy) {
    this.canvas.setBackgroundColor('#f8fafc', () => {});

    const bar = new fabric.Rect({
      left: cx,
      top: cy - 250,
      originX: 'center',
      originY: 'center',
      width: 140,
      height: 8,
      fill: '#059669',
      name: 'Accent Bar',
    });

    const title = new fabric.IText('TRANSFORM\nYOUR BODY', {
      left: cx,
      top: cy - 110,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Outfit',
      fontSize: 98,
      fontWeight: '900',
      fill: '#0f172a',
      textAlign: 'center',
      lineHeight: 0.9,
      charSpacing: -20,
    });

    const sub = new fabric.IText('30-DAY HIGH-INTENSITY FITNESS PROGRAM', {
      left: cx,
      top: cy + 40,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 22,
      fontWeight: '800',
      fill: '#059669',
      charSpacing: 80,
    });

    const features = new fabric.IText('CUSTOM MEAL PLANS  •  DAILY HIIT WORKOUTS  •  1-ON-1 COACHING', {
      left: cx,
      top: cy + 110,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 18,
      fill: '#475569',
    });

    const btn = new fabric.Rect({
      left: cx,
      top: cy + 200,
      originX: 'center',
      originY: 'center',
      width: 320,
      height: 64,
      rx: 14,
      ry: 14,
      fill: '#059669',
    });

    const btnText = new fabric.IText('START FREE TRIAL', {
      left: cx,
      top: cy + 200,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Outfit',
      fontSize: 22,
      fontWeight: 'bold',
      fill: '#ffffff',
    });

    this.canvas.add(bar, title, sub, features, btn, btnText);
  }

  // 7. YouTube Review Cover (1280x720)
  renderYouTubeReview(w, h, cx, cy) {
    this.canvas.setBackgroundColor('#ffffff', () => {});

    // Left accent block
    const leftBlock = new fabric.Rect({
      left: 0,
      top: 0,
      width: w * 0.58,
      height: h,
      fill: '#f1f5f9',
    });

    // Badge
    const tag = new fabric.Rect({
      left: 70,
      top: 70,
      width: 180,
      height: 40,
      rx: 20,
      ry: 20,
      fill: '#ef4444',
    });

    const tagText = new fabric.IText('HONEST REVIEW', {
      left: 160,
      top: 90,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Outfit',
      fontSize: 18,
      fontWeight: '800',
      fill: '#ffffff',
    });

    const title = new fabric.IText('IS IT REALLY\nWORTH IT?', {
      left: 70,
      top: 140,
      fontFamily: 'Outfit',
      fontSize: 90,
      fontWeight: '900',
      fill: '#0f172a',
      lineHeight: 0.92,
      charSpacing: -30,
    });

    const sub = new fabric.IText('30 Days Later: What They Aren\'t Telling You', {
      left: 70,
      top: 360,
      fontFamily: 'Inter',
      fontSize: 26,
      fontWeight: '600',
      fill: '#475569',
    });

    // Right Callout Box
    const callout = new fabric.Rect({
      left: w * 0.65,
      top: h * 0.25,
      width: 380,
      height: 360,
      rx: 24,
      ry: 24,
      fill: '#7c3aed',
      shadow: new fabric.Shadow({
        color: 'rgba(124, 58, 237, 0.35)',
        blur: 30,
        offsetX: 0,
        offsetY: 8,
      }),
    });

    const calloutText = new fabric.IText('NEW\nPRO\n2026', {
      left: w * 0.65 + 190,
      top: h * 0.25 + 180,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Bebas Neue',
      fontSize: 90,
      fill: '#ffffff',
      textAlign: 'center',
      lineHeight: 0.9,
    });

    this.canvas.add(leftBlock, tag, tagText, title, sub, callout, calloutText);
  }

  // 8. Minimalist Luxury Business Card (1050x600)
  renderBusinessCard(w, h, cx, cy) {
    this.canvas.setBackgroundColor('#ffffff', () => {});

    // Subtle border
    const border = new fabric.Rect({
      left: cx,
      top: cy,
      originX: 'center',
      originY: 'center',
      width: w - 60,
      height: h - 60,
      fill: 'transparent',
      stroke: '#e2e8f0',
      strokeWidth: 1.5,
    });

    const name = new fabric.IText('SOPHIA AUSTIN', {
      left: 90,
      top: 160,
      fontFamily: 'Playfair Display',
      fontSize: 48,
      fontWeight: 'bold',
      fill: '#0f172a',
      charSpacing: 40,
    });

    const role = new fabric.IText('CREATIVE DIRECTOR & BRAND STRATEGIST', {
      left: 90,
      top: 230,
      fontFamily: 'Montserrat',
      fontSize: 16,
      fontWeight: '700',
      fill: '#7c3aed',
      charSpacing: 180,
    });

    const line = new fabric.Line([90, 280, 260, 280], {
      stroke: '#d97706',
      strokeWidth: 2,
    });

    const contact = new fabric.IText('hello@sophiaaustin.design  •  +1 (555) 382-9014\nwww.sophiaaustin.design  •  San Francisco, CA', {
      left: 90,
      top: 340,
      fontFamily: 'Inter',
      fontSize: 20,
      fill: '#475569',
      lineHeight: 1.5,
    });

    // Right geometric monogram
    const monogramCircle = new fabric.Circle({
      left: w - 180,
      top: cy,
      originX: 'center',
      originY: 'center',
      radius: 90,
      fill: '#faf5ff',
      stroke: '#7c3aed',
      strokeWidth: 2,
    });

    const monogramText = new fabric.IText('SA', {
      left: w - 180,
      top: cy,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Playfair Display',
      fontSize: 72,
      fontWeight: 'bold',
      fill: '#7c3aed',
    });

    this.canvas.add(border, name, role, line, contact, monogramCircle, monogramText);
  }

  // 9. Modern Startup Pitch Slide (1920x1080)
  renderPitchDeck(w, h, cx, cy) {
    this.canvas.setBackgroundColor('#f8fafc', () => {});

    const header = new fabric.IText('MARKET OPPORTUNITY', {
      left: 120,
      top: 100,
      fontFamily: 'Montserrat',
      fontSize: 20,
      fontWeight: '800',
      fill: '#7c3aed',
      charSpacing: 200,
    });

    const mainTitle = new fabric.IText('Accelerating the $45B Creator Economy', {
      left: 120,
      top: 150,
      fontFamily: 'Outfit',
      fontSize: 68,
      fontWeight: '800',
      fill: '#0f172a',
    });

    // Metric Card 1
    const card1 = new fabric.Rect({
      left: 120,
      top: 320,
      width: 500,
      height: 480,
      rx: 24,
      ry: 24,
      fill: '#ffffff',
      stroke: '#e2e8f0',
      strokeWidth: 2,
      shadow: new fabric.Shadow({
        color: 'rgba(15, 23, 42, 0.06)',
        blur: 24,
        offsetX: 0,
        offsetY: 8,
      }),
    });

    const num1 = new fabric.IText('142%', {
      left: 170,
      top: 380,
      fontFamily: 'Outfit',
      fontSize: 90,
      fontWeight: '900',
      fill: '#7c3aed',
    });

    const label1 = new fabric.IText('Year-over-year creator tooling adoption across indie digital agencies.', {
      left: 170,
      top: 500,
      width: 400,
      fontFamily: 'Inter',
      fontSize: 24,
      fill: '#475569',
      lineHeight: 1.4,
    });

    // Metric Card 2
    const card2 = new fabric.Rect({
      left: 680,
      top: 320,
      width: 500,
      height: 480,
      rx: 24,
      ry: 24,
      fill: '#ffffff',
      stroke: '#e2e8f0',
      strokeWidth: 2,
      shadow: new fabric.Shadow({
        color: 'rgba(15, 23, 42, 0.06)',
        blur: 24,
        offsetX: 0,
        offsetY: 8,
      }),
    });

    const num2 = new fabric.IText('10M+', {
      left: 730,
      top: 380,
      fontFamily: 'Outfit',
      fontSize: 90,
      fontWeight: '900',
      fill: '#0284c7',
    });

    const label2 = new fabric.IText('Active graphic assets rendered and published directly in client browsers.', {
      left: 730,
      top: 500,
      width: 400,
      fontFamily: 'Inter',
      fontSize: 24,
      fill: '#475569',
      lineHeight: 1.4,
    });

    // Metric Card 3
    const card3 = new fabric.Rect({
      left: 1240,
      top: 320,
      width: 540,
      height: 480,
      rx: 24,
      ry: 24,
      fill: '#7c3aed',
      shadow: new fabric.Shadow({
        color: 'rgba(124, 58, 237, 0.35)',
        blur: 30,
        offsetX: 0,
        offsetY: 8,
      }),
    });

    const num3 = new fabric.IText('$1.8M', {
      left: 1290,
      top: 380,
      fontFamily: 'Outfit',
      fontSize: 90,
      fontWeight: '900',
      fill: '#ffffff',
    });

    const label3 = new fabric.IText('Target seed round to scale real-time vector rendering engine & asset pipeline.', {
      left: 1290,
      top: 500,
      width: 440,
      fontFamily: 'Inter',
      fontSize: 24,
      fill: '#e9d5ff',
      lineHeight: 1.4,
    });

    this.canvas.add(header, mainTitle, card1, num1, label1, card2, num2, label2, card3, num3, label3);
  }

  // 10. Instagram Travel Reel / Story (1080x1920)
  renderTravelStory(w, h, cx, cy) {
    this.canvas.setBackgroundColor('#f8fafc', () => {});

    // Big photo placeholder card
    const photoFrame = new fabric.Rect({
      left: cx,
      top: 600,
      originX: 'center',
      originY: 'center',
      width: w - 100,
      height: 900,
      rx: 32,
      ry: 32,
      fill: '#e2e8f0',
      stroke: '#cbd5e1',
      strokeWidth: 2,
    });

    const tag = new fabric.IText('DESTINATION GUIDE', {
      left: cx,
      top: 140,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 24,
      fontWeight: '800',
      fill: '#0284c7',
      charSpacing: 200,
    });

    const title = new fabric.IText('AMALFI COAST\nGETAWAY', {
      left: cx,
      top: 260,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Playfair Display',
      fontSize: 84,
      fontWeight: 'bold',
      fontStyle: 'italic',
      fill: '#0f172a',
      textAlign: 'center',
      lineHeight: 0.95,
    });

    const quote = new fabric.IText('“Sun-drenched cliffs, lemon groves, and azure waters.”', {
      left: cx,
      top: 1150,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Playfair Display',
      fontSize: 32,
      fontStyle: 'italic',
      fill: '#334155',
      textAlign: 'center',
    });

    const btn = new fabric.Rect({
      left: cx,
      top: 1300,
      originX: 'center',
      originY: 'center',
      width: 440,
      height: 80,
      rx: 40,
      ry: 40,
      fill: '#0284c7',
    });

    const btnText = new fabric.IText('VIEW 5-DAY ITINERARY →', {
      left: cx,
      top: 1300,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Outfit',
      fontSize: 26,
      fontWeight: 'bold',
      fill: '#ffffff',
    });

    this.canvas.add(photoFrame, tag, title, quote, btn, btnText);
  }

  // 11. Creative Executive Resume Header (800x1200)
  renderCreativeResume(w, h, cx, cy) {
    this.canvas.setBackgroundColor('#ffffff', () => {});

    // Top Dark Header Block
    const topBlock = new fabric.Rect({
      left: 0,
      top: 0,
      width: w,
      height: 280,
      fill: '#0f172a',
    });

    const name = new fabric.IText('ALEXANDER VANCE', {
      left: 60,
      top: 70,
      fontFamily: 'Outfit',
      fontSize: 48,
      fontWeight: '800',
      fill: '#ffffff',
      charSpacing: 30,
    });

    const title = new fabric.IText('SENIOR PRODUCT DESIGNER & DESIGN SYSTEMS LEAD', {
      left: 60,
      top: 140,
      fontFamily: 'Montserrat',
      fontSize: 16,
      fontWeight: '700',
      fill: '#38bdf8',
      charSpacing: 160,
    });

    const contact = new fabric.IText('alex.vance@email.com  •  +1 415-555-0199  •  portfolio.design/vance', {
      left: 60,
      top: 190,
      fontFamily: 'Inter',
      fontSize: 16,
      fill: '#94a3b8',
    });

    // Experience Section
    const expHeader = new fabric.IText('SELECTED WORK EXPERIENCE', {
      left: 60,
      top: 340,
      fontFamily: 'Montserrat',
      fontSize: 20,
      fontWeight: '800',
      fill: '#0f172a',
      charSpacing: 100,
    });

    const line = new fabric.Line([60, 380, w - 60, 380], {
      stroke: '#cbd5e1',
      strokeWidth: 2,
    });

    const job1 = new fabric.IText('Lead Product Designer  —  Starlight Labs (2023 - Present)\nArchitected design tokens and web canvas editors serving over 2M creators.\nSpearheaded a 40% reduction in workflow friction through clean-room UX.', {
      left: 60,
      top: 420,
      fontFamily: 'Inter',
      fontSize: 18,
      fill: '#334155',
      lineHeight: 1.5,
    });

    const job2 = new fabric.IText('Senior UI/UX Engineer  —  Aura Technologies (2020 - 2023)\nDesigned responsive design suites, multi-page vector export workflows, and design systems.', {
      left: 60,
      top: 550,
      fontFamily: 'Inter',
      fontSize: 18,
      fill: '#334155',
      lineHeight: 1.5,
    });

    this.canvas.add(topBlock, name, title, contact, expHeader, line, job1, job2);
  }

  // 12. Certificate of Excellence (1920x1080)
  renderAwardCertificate(w, h, cx, cy) {
    this.canvas.setBackgroundColor('#ffffff', () => {});

    // Luxurious Double Gold Border
    const outerBorder = new fabric.Rect({
      left: cx,
      top: cy,
      originX: 'center',
      originY: 'center',
      width: w - 100,
      height: h - 100,
      fill: '#fffdfa',
      stroke: '#d97706',
      strokeWidth: 3,
      shadow: new fabric.Shadow({
        color: 'rgba(217, 119, 6, 0.1)',
        blur: 24,
        offsetX: 0,
        offsetY: 6,
      }),
    });

    const innerBorder = new fabric.Rect({
      left: cx,
      top: cy,
      originX: 'center',
      originY: 'center',
      width: w - 140,
      height: h - 140,
      fill: 'transparent',
      stroke: '#fcd34d',
      strokeWidth: 1.5,
    });

    const certHeader = new fabric.IText('CERTIFICATE OF RECOGNITION', {
      left: cx,
      top: 180,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Cinzel',
      fontSize: 52,
      fontWeight: 'bold',
      fill: '#78350f',
      charSpacing: 140,
    });

    const certSub = new fabric.IText('THIS CERTIFICATE IS PROUDLY PRESENTED TO', {
      left: cx,
      top: 270,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 18,
      fontWeight: '700',
      fill: '#92400e',
      charSpacing: 200,
    });

    const recipient = new fabric.IText('Julian Henderson', {
      left: cx,
      top: 380,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Playfair Display',
      fontSize: 84,
      fontStyle: 'italic',
      fontWeight: 'bold',
      fill: '#0f172a',
    });

    const goldLine = new fabric.Line([cx - 300, 460, cx + 300, 460], {
      stroke: '#d97706',
      strokeWidth: 2,
    });

    const certBody = new fabric.IText('For exceptional leadership, mastery in modern clean-room software architecture,\nand groundbreaking creative contributions during the 2026 Academic & Tech Initiative.', {
      left: cx,
      top: 560,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 24,
      fill: '#451a03',
      textAlign: 'center',
      lineHeight: 1.5,
    });

    this.canvas.add(outerBorder, innerBorder, certHeader, certSub, recipient, goldLine, certBody);
  }

  // 13. Modern Podcast Cover (Social / Marketing)
  renderPodcastCover(w, h, cx, cy) {
    this.canvas.setBackgroundColor('#0b0f19', () => {});

    const glow1 = new fabric.Circle({
      left: cx,
      top: 320,
      radius: 360,
      fill: 'rgba(6, 182, 212, 0.14)',
      originX: 'center',
      originY: 'center',
      name: 'Cyan Glow',
    });

    const glow2 = new fabric.Circle({
      left: cx,
      top: 780,
      radius: 300,
      fill: 'rgba(217, 70, 239, 0.1)',
      originX: 'center',
      originY: 'center',
      name: 'Magenta Glow',
    });

    const epPill = new fabric.Rect({
      left: cx,
      top: 140,
      width: 240,
      height: 42,
      rx: 21,
      ry: 21,
      fill: '#1e293b',
      stroke: '#334155',
      strokeWidth: 1.5,
      originX: 'center',
      originY: 'center',
    });

    const epText = new fabric.IText('SEASON 4 • EPISODE 42', {
      left: cx,
      top: 140,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 14,
      fontWeight: '800',
      fill: '#38bdf8',
      charSpacing: 100,
    });

    const title = new fabric.IText('THE TECH\nHORIZON', {
      left: cx,
      top: 310,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Outfit',
      fontSize: 92,
      fontWeight: '900',
      fill: '#ffffff',
      textAlign: 'center',
      lineHeight: 1.05,
    });

    const subtitle = new fabric.IText('CREATIVE SYSTEMS & GENERATIVE AI', {
      left: cx,
      top: 450,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Space Grotesk',
      fontSize: 20,
      fontWeight: '700',
      fill: '#94a3b8',
      charSpacing: 140,
    });

    // Dynamic audio wave bars
    const waveGroup = [];
    const heights = [30, 65, 110, 160, 95, 200, 240, 170, 130, 210, 260, 190, 120, 80, 45];
    const barWidth = 14;
    const spacing = 26;
    const startX = cx - (heights.length * spacing) / 2;

    heights.forEach((ht, idx) => {
      const bar = new fabric.Rect({
        left: startX + idx * spacing,
        top: 640,
        width: barWidth,
        height: ht,
        rx: 7,
        ry: 7,
        originX: 'center',
        originY: 'center',
        fill: idx % 2 === 0 ? '#06b6d4' : '#818cf8',
      });
      waveGroup.push(bar);
    });

    const hostBox = new fabric.Rect({
      left: cx,
      top: 860,
      width: 580,
      height: 60,
      rx: 30,
      ry: 30,
      fill: 'rgba(255, 255, 255, 0.05)',
      stroke: 'rgba(255, 255, 255, 0.15)',
      strokeWidth: 1,
      originX: 'center',
      originY: 'center',
    });

    const hostText = new fabric.IText('HOSTED BY MARCUS VANCE & DR. MAYA LIN', {
      left: cx,
      top: 860,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: '600',
      fill: '#cbd5e1',
      charSpacing: 80,
    });

    const platformBadge = new fabric.IText('STREAMING NOW ON ALL MAJOR AUDIO PLATFORMS', {
      left: cx,
      top: 980,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 13,
      fontWeight: '700',
      fill: '#64748b',
      charSpacing: 120,
    });

    this.canvas.add(glow1, glow2, epPill, epText, title, subtitle, ...waveGroup, hostBox, hostText, platformBadge);
  }

  // 14. Luxury Real Estate Showcase (Business / Marketing)
  renderRealEstate(w, h, cx, cy) {
    this.canvas.setBackgroundColor('#fcfbf9', () => {});

    const outerBorder = new fabric.Rect({
      left: cx,
      top: cy,
      originX: 'center',
      originY: 'center',
      width: w - 80,
      height: h - 80,
      fill: 'transparent',
      stroke: '#e2e8f0',
      strokeWidth: 2,
    });

    const tag = new fabric.IText('EXCLUSIVE LUXURY PORTFOLIO', {
      left: cx,
      top: 100,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Cinzel',
      fontSize: 16,
      fontWeight: 'bold',
      fill: '#b45309',
      charSpacing: 220,
    });

    // Architectural Photo Frame Placeholder
    const photoFrame = new fabric.Rect({
      left: cx,
      top: 400,
      originX: 'center',
      originY: 'center',
      width: 920,
      height: 480,
      rx: 12,
      ry: 12,
      fill: '#f1f5f9',
      stroke: '#cbd5e1',
      strokeWidth: 1.5,
      shadow: new fabric.Shadow({
        color: 'rgba(15, 23, 42, 0.08)',
        blur: 24,
        offsetY: 10,
      }),
    });

    const photoLabel = new fabric.IText('MODERN MINIMALIST VILLA • PACIFIC HEIGHTS', {
      left: cx,
      top: 400,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Playfair Display',
      fontSize: 28,
      fontStyle: 'italic',
      fontWeight: 'bold',
      fill: '#64748b',
    });

    const title = new fabric.IText('THE AURA RESIDENCE', {
      left: cx,
      top: 700,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Playfair Display',
      fontSize: 58,
      fontWeight: 'bold',
      fill: '#0f172a',
    });

    const address = new fabric.IText('1482 Pacific Heights Boulevard • San Francisco, CA', {
      left: cx,
      top: 755,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 18,
      fill: '#64748b',
    });

    // Stats Pills (Beds, Baths, SqFt)
    const stats = ['4 BEDROOMS', '4.5 BATHS', '5,400 SQ FT'];
    const statCards = [];
    [-240, 0, 240].forEach((offset, idx) => {
      const card = new fabric.Rect({
        left: cx + offset,
        top: 840,
        originX: 'center',
        originY: 'center',
        width: 200,
        height: 48,
        rx: 8,
        ry: 8,
        fill: '#ffffff',
        stroke: '#e2e8f0',
        strokeWidth: 1.5,
      });
      const txt = new fabric.IText(stats[idx], {
        left: cx + offset,
        top: 840,
        originX: 'center',
        originY: 'center',
        fontFamily: 'Montserrat',
        fontSize: 14,
        fontWeight: '700',
        fill: '#0f172a',
      });
      statCards.push(card, txt);
    });

    const priceText = new fabric.IText('OFFERED AT $3,450,000 USD', {
      left: cx,
      top: 940,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 24,
      fontWeight: '900',
      fill: '#b45309',
      charSpacing: 60,
    });

    const footerText = new fabric.IText('SOTHEBY’S PREMIER REALTY • INQUIRIES: (415) 890-2210', {
      left: cx,
      top: 990,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 13,
      fontWeight: '600',
      fill: '#94a3b8',
      charSpacing: 100,
    });

    this.canvas.add(outerBorder, tag, photoFrame, photoLabel, title, address, ...statCards, priceText, footerText);
  }

  // 15. Luxury Wedding & Gala Invitation (Events)
  renderWeddingInvitation(w, h, cx, cy) {
    this.canvas.setBackgroundColor('#fdfcf9', () => {});

    const outerBorder = new fabric.Rect({
      left: cx,
      top: cy,
      originX: 'center',
      originY: 'center',
      width: w - 120,
      height: h - 140,
      fill: 'transparent',
      stroke: '#d97706',
      strokeWidth: 2,
    });

    const innerBorder = new fabric.Rect({
      left: cx,
      top: cy,
      originX: 'center',
      originY: 'center',
      width: w - 160,
      height: h - 180,
      fill: 'transparent',
      stroke: 'rgba(217, 119, 6, 0.4)',
      strokeWidth: 1,
      strokeDashArray: [6, 4],
    });

    const leadText = new fabric.IText('TOGETHER WITH THEIR FAMILIES', {
      left: cx,
      top: 360,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 20,
      fontWeight: '600',
      fill: '#92400e',
      charSpacing: 240,
    });

    const name1 = new fabric.IText('Eleanor Rose', {
      left: cx,
      top: 520,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Playfair Display',
      fontSize: 88,
      fontStyle: 'italic',
      fontWeight: 'bold',
      fill: '#451a03',
    });

    const ampersand = new fabric.IText('&', {
      left: cx,
      top: 640,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Playfair Display',
      fontSize: 54,
      fontStyle: 'italic',
      fill: '#d97706',
    });

    const name2 = new fabric.IText('Julian Alexander', {
      left: cx,
      top: 760,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Playfair Display',
      fontSize: 88,
      fontStyle: 'italic',
      fontWeight: 'bold',
      fill: '#451a03',
    });

    const inviteBody = new fabric.IText('REQUEST THE HONOR OF YOUR PRESENCE\nAT THE CELEBRATION OF THEIR MARRIAGE', {
      left: cx,
      top: 960,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 22,
      fontWeight: '500',
      fill: '#78350f',
      textAlign: 'center',
      lineHeight: 1.6,
      charSpacing: 100,
    });

    const divLine = new fabric.Line([cx - 180, 1080, cx + 180, 1080], {
      stroke: '#d97706',
      strokeWidth: 1.5,
    });

    const dateText = new fabric.IText('SATURDAY, OCTOBER 24, 2026', {
      left: cx,
      top: 1160,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Cinzel',
      fontSize: 28,
      fontWeight: 'bold',
      fill: '#92400e',
      charSpacing: 140,
    });

    const timeText = new fabric.IText('AT FIVE O’CLOCK IN THE EVENING', {
      left: cx,
      top: 1220,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 18,
      fill: '#78350f',
      charSpacing: 120,
    });

    const venue = new fabric.IText('THE BEL AIR ESTATE & BOTANICAL GARDENS\nLOS ANGELES, CALIFORNIA', {
      left: cx,
      top: 1360,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Cinzel',
      fontSize: 22,
      fill: '#451a03',
      textAlign: 'center',
      lineHeight: 1.5,
    });

    const rsvpBox = new fabric.Rect({
      left: cx,
      top: 1540,
      originX: 'center',
      originY: 'center',
      width: 440,
      height: 54,
      rx: 27,
      ry: 27,
      fill: '#92400e',
    });

    const rsvpText = new fabric.IText('RECEPTION TO FOLLOW • RSVP BY SEPT 15', {
      left: cx,
      top: 1540,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 14,
      fontWeight: 'bold',
      fill: '#ffffff',
      charSpacing: 120,
    });

    this.canvas.add(outerBorder, innerBorder, leadText, name1, ampersand, name2, inviteBody, divLine, dateText, timeText, venue, rsvpBox, rsvpText);
  }

  // 16. Modern E-Book Cover (Marketing / Business)
  renderEbookCover(w, h, cx, cy) {
    this.canvas.setBackgroundColor('#0f172a', () => {});

    const glowCircle = new fabric.Circle({
      left: cx,
      top: 500,
      radius: 400,
      fill: 'rgba(99, 102, 241, 0.22)',
      originX: 'center',
      originY: 'center',
      name: 'Indigo Glow',
    });

    const spineSim = new fabric.Line([40, 0, 40, h], {
      stroke: 'rgba(255, 255, 255, 0.08)',
      strokeWidth: 4,
    });

    const author = new fabric.IText('INTERNATIONAL BESTSELLER • MARCUS STERLING', {
      left: cx,
      top: 140,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 16,
      fontWeight: '800',
      fill: '#94a3b8',
      charSpacing: 180,
    });

    const titleLine1 = new fabric.IText('THE SYSTEM', {
      left: cx,
      top: 320,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Outfit',
      fontSize: 88,
      fontWeight: '900',
      fill: '#ffffff',
      charSpacing: 80,
    });

    const titleLine2 = new fabric.IText('ARCHITECT', {
      left: cx,
      top: 420,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Outfit',
      fontSize: 88,
      fontWeight: '900',
      fill: '#38bdf8',
      charSpacing: 80,
    });

    const subtitle = new fabric.IText('A Masterclass in High-Performance Software Engineering,\nDistributed Systems & Clean-Room Production Architecture', {
      left: cx,
      top: 580,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 22,
      fill: '#cbd5e1',
      textAlign: 'center',
      lineHeight: 1.4,
    });

    // Tech Blueprint Graphic Box
    const graphicBox = new fabric.Rect({
      left: cx,
      top: 860,
      originX: 'center',
      originY: 'center',
      width: 720,
      height: 280,
      rx: 16,
      ry: 16,
      fill: 'rgba(30, 41, 59, 0.7)',
      stroke: '#38bdf8',
      strokeWidth: 2,
    });

    const graphicText = new fabric.IText('❖ SCALE • RESILIENCE • SIMPLICITY ❖\nMODERN PRINCIPLES FOR HIGH-OUTPUT ENGINEERS', {
      left: cx,
      top: 860,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Space Grotesk',
      fontSize: 22,
      fontWeight: '700',
      fill: '#e2e8f0',
      textAlign: 'center',
      lineHeight: 1.6,
      charSpacing: 80,
    });

    const awardPill = new fabric.Rect({
      left: cx,
      top: 1180,
      originX: 'center',
      originY: 'center',
      width: 560,
      height: 52,
      rx: 26,
      ry: 26,
      fill: '#f59e0b',
    });

    const awardText = new fabric.IText('★ OVER 150,000 COPIES SOLD WORLDWIDE ★', {
      left: cx,
      top: 1180,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 16,
      fontWeight: '900',
      fill: '#0f172a',
      charSpacing: 100,
    });

    const publisher = new fabric.IText('APEX ENGINEERING PRESS • 2026 EDITION', {
      left: cx,
      top: 1320,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 15,
      fontWeight: '600',
      fill: '#64748b',
      charSpacing: 120,
    });

    this.canvas.add(glowCircle, spineSim, author, titleLine1, titleLine2, subtitle, graphicBox, graphicText, awardPill, awardText, publisher);
  }

  // 17. Minimalist Studio Invoice (Business)
  renderBrandInvoice(w, h, cx, cy) {
    this.canvas.setBackgroundColor('#ffffff', () => {});

    const brandName = new fabric.IText('ATELIER STUDIO', {
      left: 120,
      top: 140,
      fontFamily: 'Outfit',
      fontSize: 44,
      fontWeight: 'bold',
      fill: '#0f172a',
    });

    const brandSub = new fabric.IText('Design & Engineering Consultancy • San Francisco, CA', {
      left: 120,
      top: 195,
      fontFamily: 'Inter',
      fontSize: 18,
      fill: '#64748b',
    });

    const invTitle = new fabric.IText('INVOICE', {
      left: w - 120,
      top: 140,
      originX: 'right',
      fontFamily: 'Montserrat',
      fontSize: 40,
      fontWeight: '900',
      fill: '#2563eb',
      charSpacing: 100,
    });

    const invMeta = new fabric.IText('Invoice No: #INV-2026-089\nDate: October 17, 2026\nDue: November 16, 2026', {
      left: w - 120,
      top: 195,
      originX: 'right',
      fontFamily: 'Inter',
      fontSize: 16,
      fill: '#475569',
      lineHeight: 1.4,
    });

    const topDiv = new fabric.Line([120, 270, w - 120, 270], {
      stroke: '#e2e8f0',
      strokeWidth: 2,
    });

    // Client Info
    const billToLabel = new fabric.IText('BILLED TO:', {
      left: 120,
      top: 310,
      fontFamily: 'Montserrat',
      fontSize: 14,
      fontWeight: 'bold',
      fill: '#94a3b8',
      charSpacing: 100,
    });

    const billToDetails = new fabric.IText('Acme Global Technologies Inc.\nAttn: Accounts Payable\n500 Howard Street, Suite 400\nSan Francisco, CA 94105', {
      left: 120,
      top: 340,
      fontFamily: 'Inter',
      fontSize: 18,
      fill: '#1e293b',
      lineHeight: 1.4,
    });

    // Table Header
    const tableHeaderBg = new fabric.Rect({
      left: cx,
      top: 520,
      originX: 'center',
      originY: 'center',
      width: w - 240,
      height: 48,
      rx: 6,
      ry: 6,
      fill: '#f8fafc',
    });

    const thDesc = new fabric.IText('DESCRIPTION', {
      left: 150,
      top: 520,
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 14,
      fontWeight: 'bold',
      fill: '#475569',
    });

    const thQty = new fabric.IText('HOURS / QTY', {
      left: 700,
      top: 520,
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 14,
      fontWeight: 'bold',
      fill: '#475569',
    });

    const thRate = new fabric.IText('RATE', {
      left: 880,
      top: 520,
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 14,
      fontWeight: 'bold',
      fill: '#475569',
    });

    const thAmount = new fabric.IText('AMOUNT', {
      left: w - 150,
      top: 520,
      originX: 'right',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 14,
      fontWeight: 'bold',
      fill: '#475569',
    });

    // Row 1
    const r1Desc = new fabric.IText('Brand Identity & Clean Design System System Architecture', { left: 150, top: 590, fontFamily: 'Inter', fontSize: 17, fill: '#0f172a' });
    const r1Qty = new fabric.IText('35 hrs', { left: 700, top: 590, fontFamily: 'Inter', fontSize: 17, fill: '#475569' });
    const r1Rate = new fabric.IText('$150.00', { left: 880, top: 590, fontFamily: 'Inter', fontSize: 17, fill: '#475569' });
    const r1Amount = new fabric.IText('$5,250.00', { left: w - 150, top: 590, originX: 'right', fontFamily: 'Montserrat', fontSize: 17, fontWeight: 'bold', fill: '#0f172a' });

    const row1Line = new fabric.Line([120, 630, w - 120, 630], { stroke: '#f1f5f9', strokeWidth: 1.5 });

    // Row 2
    const r2Desc = new fabric.IText('Interactive Web Application Prototyping & High-Fidelity UI', { left: 150, top: 670, fontFamily: 'Inter', fontSize: 17, fill: '#0f172a' });
    const r2Qty = new fabric.IText('25 hrs', { left: 700, top: 670, fontFamily: 'Inter', fontSize: 17, fill: '#475569' });
    const r2Rate = new fabric.IText('$150.00', { left: 880, top: 670, fontFamily: 'Inter', fontSize: 17, fill: '#475569' });
    const r2Amount = new fabric.IText('$3,750.00', { left: w - 150, top: 670, originX: 'right', fontFamily: 'Montserrat', fontSize: 17, fontWeight: 'bold', fill: '#0f172a' });

    const row2Line = new fabric.Line([120, 710, w - 120, 710], { stroke: '#f1f5f9', strokeWidth: 1.5 });

    // Row 3
    const r3Desc = new fabric.IText('Production Optimization, Cross-Platform Testing & Hand-off', { left: 150, top: 750, fontFamily: 'Inter', fontSize: 17, fill: '#0f172a' });
    const r3Qty = new fabric.IText('10 hrs', { left: 700, top: 750, fontFamily: 'Inter', fontSize: 17, fill: '#475569' });
    const r3Rate = new fabric.IText('$150.00', { left: 880, top: 750, fontFamily: 'Inter', fontSize: 17, fill: '#475569' });
    const r3Amount = new fabric.IText('$1,500.00', { left: w - 150, top: 750, originX: 'right', fontFamily: 'Montserrat', fontSize: 17, fontWeight: 'bold', fill: '#0f172a' });

    const row3Line = new fabric.Line([120, 790, w - 120, 790], { stroke: '#e2e8f0', strokeWidth: 2 });

    // Total Box
    const totalBox = new fabric.Rect({
      left: w - 120,
      top: 890,
      originX: 'right',
      originY: 'center',
      width: 360,
      height: 64,
      rx: 8,
      ry: 8,
      fill: '#0f172a',
    });

    const totalText = new fabric.IText('TOTAL DUE: $10,500.00', {
      left: w - 140,
      top: 890,
      originX: 'right',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 20,
      fontWeight: 'bold',
      fill: '#ffffff',
    });

    // Payment Stamp
    const paidBadge = new fabric.Rect({
      left: 120,
      top: 890,
      originY: 'center',
      width: 200,
      height: 52,
      rx: 26,
      ry: 26,
      fill: '#ecfdf5',
      stroke: '#10b981',
      strokeWidth: 2,
    });

    const paidText = new fabric.IText('✓ PAID WITH THANKS', {
      left: 220,
      top: 890,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 14,
      fontWeight: 'bold',
      fill: '#059669',
    });

    // Banking Details Footer
    const bankDetails = new fabric.IText('Payment Method: Direct Deposit / Wire • Bank of America NA • Routing: 121000358 • Account: **** 8829\nThank you for your partnership! For inquiries, contact accounting@atelierstudio.design', {
      left: cx,
      top: 1460,
      originX: 'center',
      fontFamily: 'Inter',
      fontSize: 15,
      fill: '#94a3b8',
      textAlign: 'center',
      lineHeight: 1.5,
    });

    this.canvas.add(
      brandName, brandSub, invTitle, invMeta, topDiv,
      billToLabel, billToDetails,
      tableHeaderBg, thDesc, thQty, thRate, thAmount,
      r1Desc, r1Qty, r1Rate, r1Amount, row1Line,
      r2Desc, r2Qty, r2Rate, r2Amount, row2Line,
      r3Desc, r3Qty, r3Rate, r3Amount, row3Line,
      totalBox, totalText, paidBadge, paidText, bankDetails
    );
  }

  // 18. Product Launch Announcement (Marketing / Presentation)
  renderProductLaunch(w, h, cx, cy) {
    this.canvas.setBackgroundColor('#f8fafc', () => {});

    const glow1 = new fabric.Circle({
      left: w * 0.85,
      top: h * 0.2,
      radius: 380,
      fill: 'rgba(99, 102, 241, 0.1)',
      originX: 'center',
      originY: 'center',
    });

    const glow2 = new fabric.Circle({
      left: w * 0.15,
      top: h * 0.8,
      radius: 340,
      fill: 'rgba(56, 189, 248, 0.1)',
      originX: 'center',
      originY: 'center',
    });

    const pillBadge = new fabric.Rect({
      left: cx,
      top: 160,
      originX: 'center',
      originY: 'center',
      width: 320,
      height: 44,
      rx: 22,
      ry: 22,
      fill: '#ede9fe',
    });

    const pillText = new fabric.IText('🚀 INTRODUCING DESIGNPRO 4.0', {
      left: cx,
      top: 160,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 14,
      fontWeight: '800',
      fill: '#7c3aed',
      charSpacing: 80,
    });

    const headline = new fabric.IText('The Next Generation of\nVisual Craftsmanship.', {
      left: cx,
      top: 310,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Outfit',
      fontSize: 78,
      fontWeight: 'bold',
      fill: '#0f172a',
      textAlign: 'center',
      lineHeight: 1.1,
    });

    const subheadline = new fabric.IText('Built for modern creators who demand speed, elegance, and uncompromised precision.\nZero latency, infinite vector fidelity, and instant production export.', {
      left: cx,
      top: 460,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 24,
      fill: '#475569',
      textAlign: 'center',
      lineHeight: 1.5,
    });

    // 3 Highlight Feature Cards
    const cards = [
      { title: '⚡ 60 FPS Engine', desc: 'Silky smooth vector transforms and manipulation with zero frame drops.' },
      { title: '🎨 Harmonic Palettes', desc: 'Over 20 curated color palettes crafted for instant aesthetic balance.' },
      { title: '📦 Multi-Format Export', desc: 'One-click export to 4K PNG, vector SVG, crisp JPEG, and PDF documents.' },
    ];

    const cardObjects = [];
    const cardWidth = 420;
    const cardSpacing = 460;
    const startCardX = cx - cardSpacing;

    cards.forEach((c, idx) => {
      const cardX = startCardX + idx * cardSpacing;
      const bg = new fabric.Rect({
        left: cardX,
        top: 680,
        originX: 'center',
        originY: 'center',
        width: cardWidth,
        height: 180,
        rx: 16,
        ry: 16,
        fill: '#ffffff',
        stroke: '#e2e8f0',
        strokeWidth: 1.5,
        shadow: new fabric.Shadow({
          color: 'rgba(15, 23, 42, 0.05)',
          blur: 16,
          offsetY: 6,
        }),
      });

      const cardTitle = new fabric.IText(c.title, {
        left: cardX,
        top: 640,
        originX: 'center',
        originY: 'center',
        fontFamily: 'Outfit',
        fontSize: 22,
        fontWeight: 'bold',
        fill: '#0f172a',
      });

      const cardDesc = new fabric.IText(c.desc, {
        left: cardX,
        top: 710,
        originX: 'center',
        originY: 'center',
        width: 360,
        fontFamily: 'Inter',
        fontSize: 16,
        fill: '#64748b',
        textAlign: 'center',
        lineHeight: 1.4,
      });

      cardObjects.push(bg, cardTitle, cardDesc);
    });

    const ctaBtn = new fabric.Rect({
      left: cx,
      top: 890,
      originX: 'center',
      originY: 'center',
      width: 280,
      height: 60,
      rx: 30,
      ry: 30,
      fill: '#7c3aed',
      shadow: new fabric.Shadow({
        color: 'rgba(124, 58, 237, 0.35)',
        blur: 20,
        offsetY: 8,
      }),
    });

    const ctaText = new fabric.IText('START CREATING FREE', {
      left: cx,
      top: 890,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Montserrat',
      fontSize: 16,
      fontWeight: 'bold',
      fill: '#ffffff',
      charSpacing: 100,
    });

    this.canvas.add(glow1, glow2, pillBadge, pillText, headline, subheadline, ...cardObjects, ctaBtn, ctaText);
  }

  // =========================================================================
  // Modular Template Catalog, Custom Vault & Pack Sharing
  // =========================================================================

  async initTemplateHub() {
    await this.loadCatalogTemplates();
    await this.renderCustomTemplates();
    this.setupTemplateSearch();
  }

  // Load external modular catalog
  async loadCatalogTemplates() {
    try {
      const res = await fetch('templates/templates-catalog.json');
      if (res.ok) {
        this.catalogTemplates = await res.json();
      }
    } catch (e) {
      this.catalogTemplates = this.getFallbackCatalog();
    }
    this.renderCatalogTemplates();
  }

  // Filter all templates (presets, modular catalog, custom templates)
  filterAllTemplates() {
    const query = (this.searchQuery || '').toLowerCase();
    const cat = this.currentCategory || 'all';

    // 1. Filter Preset Hardcoded Cards
    const presetCards = document.querySelectorAll('#templates-grid .template-card:not(.dynamic-catalog-card)');
    presetCards.forEach(card => {
      const cardCat = (card.getAttribute('data-category') || '').toLowerCase();
      const cardTitle = (card.querySelector('.template-name')?.textContent || '').toLowerCase();
      const matchCat = cat === 'all' || cardCat === cat;
      const matchQuery = !query || cardTitle.includes(query) || cardCat.includes(query);
      card.style.display = (matchCat && matchQuery) ? 'flex' : 'none';
    });

    // 2. Filter & Render Modular Catalog Cards
    this.renderCatalogTemplates();

    // 3. Filter My Custom Saved Templates
    const customCards = document.querySelectorAll('#my-templates-grid .my-custom-template-card');
    customCards.forEach(card => {
      const cardTitle = (card.querySelector('.template-name')?.textContent || '').toLowerCase();
      const matchQuery = !query || cardTitle.includes(query);
      card.style.display = matchQuery ? 'flex' : 'none';
    });
  }

  // Render modular catalog cards in #templates-grid
  renderCatalogTemplates() {
    const grid = document.getElementById('templates-grid');
    if (!grid) return;

    const filtered = (this.catalogTemplates || []).filter(t => {
      const matchCat = !this.currentCategory || this.currentCategory === 'all' || t.category === this.currentCategory;
      const matchQuery = !this.searchQuery || t.name.toLowerCase().includes(this.searchQuery) || (t.description && t.description.toLowerCase().includes(this.searchQuery)) || t.category.toLowerCase().includes(this.searchQuery);
      return matchCat && matchQuery;
    });

    const existingDynamic = grid.querySelectorAll('.dynamic-catalog-card');
    existingDynamic.forEach(el => el.remove());

    filtered.forEach(t => {
      const card = document.createElement('div');
      card.className = 'template-card dynamic-catalog-card';
      card.setAttribute('data-template-id', t.id);
      card.setAttribute('data-category', t.category);
      card.innerHTML = `
        <div class="template-thumb" style="background: ${t.previewGradient || '#18181b'};">
          <div style="font-weight: 800; color: ${t.accentColor || '#ffffff'}; font-size: 0.95rem; text-align: center; padding: 10px; line-height: 1.2;">
            ${t.name}
          </div>
        </div>
        <div class="template-info">
          <div class="template-name">${t.name}</div>
          <div class="template-category">${t.category.toUpperCase()} (${t.dimensions.width}×${t.dimensions.height})</div>
        </div>
      `;
      card.addEventListener('click', () => {
        this.loadCatalogTemplate(t);
      });
      grid.appendChild(card);
    });
  }

  // Load a modular JSON template onto canvas
  loadCatalogTemplate(t) {
    if (!t || !this.canvas) return;
    if (this.canvasManager) this.canvasManager.isBatchLoading = true;
    this.canvas.clear();

    if (t.dimensions) {
      this.canvasManager.setArtboardSize(t.dimensions.width, t.dimensions.height);
    }
    if (t.background) {
      this.canvas.setBackgroundColor(t.background, () => {});
    }

    if (Array.isArray(t.objects)) {
      t.objects.forEach(objData => {
        let fabricObj = null;
        const options = { ...objData };
        if (options.shadow && typeof options.shadow === 'object' && !(options.shadow instanceof fabric.Shadow)) {
          options.shadow = new fabric.Shadow(options.shadow);
        }

        switch (objData.type) {
          case 'rect':
            fabricObj = new fabric.Rect(options);
            break;
          case 'circle':
            fabricObj = new fabric.Circle(options);
            break;
          case 'triangle':
            fabricObj = new fabric.Triangle(options);
            break;
          case 'i-text':
            fabricObj = new fabric.IText(options.text || '', options);
            break;
          case 'polygon':
            fabricObj = new fabric.Polygon(options.points || [], options);
            break;
          case 'line':
            fabricObj = new fabric.Line(options.points || [0, 0, 100, 100], options);
            break;
          default:
            break;
        }
        if (fabricObj) {
          this.canvas.add(fabricObj);
        }
      });
    }

    this.canvas.renderAll();
    if (this.canvasManager) this.canvasManager.isBatchLoading = false;
    this.canvasManager.recordState();
    if (window.app && window.app.layers) window.app.layers.renderLayers();
    if (window.showToast) window.showToast(`Loaded template: ${t.name}`, 'success');
  }

  // Save current artboard as a custom reusable template in IndexedDB (Strategy 1)
  async saveCurrentAsCustomTemplate(name = 'My Custom Template', category = 'custom') {
    if (!this.canvas) return;

    const artW = this.canvasManager ? this.canvasManager.artboardWidth : 1080;
    const artH = this.canvasManager ? this.canvasManager.artboardHeight : 1080;

    const thumbnail = this.canvas.toDataURL({
      format: 'jpeg',
      quality: 0.6,
      multiplier: 0.18,
    });

    const canvasJson = this.canvas.toJSON(['isGuide', 'isLocked', 'name', 'shadow']);

    const templateRecord = {
      id: 'tpl_custom_' + Date.now(),
      name: name.trim() || 'Custom Template',
      category: category.toLowerCase(),
      artboardWidth: artW,
      artboardHeight: artH,
      thumbnail: thumbnail,
      json: canvasJson,
      createdAt: Date.now(),
    };

    if (window.app && window.app.storage) {
      await window.app.storage.saveCustomTemplate(templateRecord);
      await this.renderCustomTemplates();
      if (window.showToast) {
        window.showToast(`Saved "${templateRecord.name}" to My Templates!`, 'success');
      }
    }
  }

  // Render user's custom templates in #my-templates-grid
  async renderCustomTemplates() {
    const grid = document.getElementById('my-templates-grid');
    const countBadge = document.getElementById('my-templates-count');
    if (!grid) return;

    let templates = [];
    if (window.app && window.app.storage) {
      templates = await window.app.storage.getCustomTemplates();
    }
    this.customTemplates = templates;

    if (countBadge) {
      countBadge.textContent = templates.length;
    }

    grid.innerHTML = '';
    if (templates.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 18px 12px; text-align: center; color: var(--text-muted); font-size: 0.8rem; background: rgba(0,0,0,0.02); border-radius: 8px; border: 1px dashed var(--border-color);">
          No saved templates yet.<br/>Click <strong>"Save as Template"</strong> above to store your custom designs.
        </div>
      `;
      return;
    }

    templates.forEach(t => {
      const card = document.createElement('div');
      card.className = 'template-card my-custom-template-card';
      card.innerHTML = `
        <div class="template-thumb" style="background: #ffffff; display: flex; align-items: center; justify-content: center; position: relative;">
          <img src="${t.thumbnail}" alt="${t.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
          <button class="btn-delete-template" style="position: absolute; top: 4px; right: 4px; background: rgba(239, 68, 68, 0.85); color: white; border: none; border-radius: 4px; width: 22px; height: 22px; font-size: 11px; cursor: pointer;" title="Delete Template">✕</button>
        </div>
        <div class="template-info">
          <div class="template-name">${t.name}</div>
          <div class="template-category">Saved Design (${t.artboardWidth}×${t.artboardHeight})</div>
        </div>
      `;

      card.querySelector('.template-thumb').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete-template')) return;
        this.loadCustomTemplate(t);
      });

      card.querySelector('.btn-delete-template').addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm(`Delete custom template "${t.name}"?`)) {
          if (window.app && window.app.storage) {
            await window.app.storage.deleteCustomTemplate(t.id);
            await this.renderCustomTemplates();
            if (window.showToast) window.showToast(`Deleted template "${t.name}"`, 'info');
          }
        }
      });

      grid.appendChild(card);
    });
  }

  // Load a user's custom template
  loadCustomTemplate(t) {
    if (!t || !t.json || !this.canvas) return;
    if (this.canvasManager) {
      this.canvasManager.isBatchLoading = true;
      this.canvasManager.setArtboardSize(t.artboardWidth || 1080, t.artboardHeight || 1080);
    }

    this.canvas.loadFromJSON(t.json, () => {
      this.canvas.renderAll();
      if (this.canvasManager) {
        this.canvasManager.isBatchLoading = false;
        this.canvasManager.recordState();
      }
      if (window.app && window.app.layers) window.app.layers.renderLayers();
      if (window.showToast) window.showToast(`Loaded custom template: ${t.name}`, 'success');
    });
  }

  // Export custom templates as a .designpro-pack (Strategy 3)
  async exportTemplatePack() {
    let templates = this.customTemplates;
    if (!templates || templates.length === 0) {
      if (window.showToast) window.showToast('No custom templates to export. Save a template first!', 'error');
      return;
    }

    const pack = {
      packName: 'Pixels-Design-Pack',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      templateCount: templates.length,
      templates: templates,
    };

    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixels-templates-pack-${Date.now()}.designpro-pack`;
    a.click();
    URL.revokeObjectURL(url);
    if (window.showToast) window.showToast('Exported template pack!', 'success');
  }

  // Import template pack (.designpro-pack or .json)
  async importTemplatePack(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const pack = JSON.parse(e.target.result);
        const templates = Array.isArray(pack) ? pack : (pack.templates || []);
        if (templates.length === 0) {
          if (window.showToast) window.showToast('No templates found in file.', 'error');
          return;
        }

        if (window.app && window.app.storage) {
          for (const t of templates) {
            await window.app.storage.saveCustomTemplate({
              ...t,
              id: 'tpl_custom_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
            });
          }
          await this.renderCustomTemplates();
          if (window.showToast) window.showToast(`Imported ${templates.length} templates successfully!`, 'success');
        }
      } catch (err) {
        if (window.showToast) window.showToast('Invalid template pack file.', 'error');
      }
    };
    reader.readAsText(file);
  }

  // Setup Search and Filter category listeners
  setupTemplateSearch() {
    const searchInput = document.getElementById('template-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.filterAllTemplates();
      });
    }

    document.querySelectorAll('.category-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.getAttribute('data-category') || 'all';
        this.filterAllTemplates();
      });
    });
  }

  getFallbackCatalog() {
    return [
      {
        id: 'tpl-cyber-flash',
        name: 'Cyber Flash Sale',
        category: 'marketing',
        dimensions: { width: 1080, height: 1080 },
        background: '#09090b',
        previewGradient: 'linear-gradient(135deg, #09090b, #18181b)',
        accentColor: '#06b6d4',
        objects: [
          { type: 'i-text', left: 540, top: 440, text: 'CYBER WEEK', fontSize: 82, fontFamily: 'Bebas Neue', fill: '#ffffff', originX: 'center', originY: 'center' },
          { type: 'i-text', left: 540, top: 550, text: '70% OFF', fontSize: 96, fontFamily: 'Outfit', fontWeight: 900, fill: '#06b6d4', originX: 'center', originY: 'center' }
        ]
      }
    ];
  }
}

window.TemplatesEngine = TemplatesEngine;
