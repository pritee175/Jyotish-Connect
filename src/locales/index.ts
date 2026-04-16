import type { QueryDomain, QueryStatus, RemedyType } from '@/types'

type TranslationMap = Record<string, string>

export const translations: Record<'en' | 'mr', TranslationMap> = {
  en: {
    // App
    appName:           'JyotishConnect',
    tagline:           'Trusted Astrology Consultations',
    switchLang:        'मराठी',

    // Auth
    login:             'Login',
    logout:            'Logout',
    register:          'Register',
    phoneNumber:       'Phone Number',
    name:              'Your Name',
    email:             'Email (optional)',
    sendOtp:           'Send OTP',
    verifyOtp:         'Verify OTP',
    enterOtp:          'Enter 6-digit OTP',
    otpSent:           'OTP sent to your number',
    newUser:           "Don't have an account?",
    existingUser:      'Already have an account?',

    // Navigation
    myQueries:         'My Queries',
    askQuery:          'Ask a Query',
    savedPersons:      'Saved Persons',
    profile:           'Profile',
    dashboard:         'Dashboard',
    queryInbox:        'Query Inbox',
    templates:         'Templates',
    remedies:          'Remedies',

    // Query Form
    selectDomain:      'Select Topic',
    personDetails:     'Person Details',
    personName:        'Person\'s Full Name',
    dob:               'Date of Birth',
    tob:               'Time of Birth',
    pob:               'Place of Birth',
    currentCity:       'Current City',
    gender:            'Gender',
    male:              'Male',
    female:            'Female',
    other:             'Other',
    relation:          'Relation to You',
    self:              'Self',
    spouse:            'Spouse',
    child:             'Child',
    parent:            'Parent',
    sibling:           'Sibling',
    friend:            'Friend',
    other:             'Other',
    pastRemedies:      'Any past remedies done? (optional)',
    queryText:         'Your Question',
    queryPlaceholder:  'Describe your question in detail...',
    submitQuery:       'Submit Query',
    loadSavedPerson:   'Load Saved Person',
    saveThisPerson:    'Save this person for future use',

    // Status
    status_pending_review: 'Under Review',
    status_fee_set:        'Fee Set — Awaiting Payment',
    status_paid:           'Payment Received',
    status_in_progress:    'Answer in Progress',
    status_clarification:  'Clarification Needed',
    status_answered:       'Answered',
    status_closed:         'Closed',
    status_rejected:       'Rejected',

    // Admin
    approve:           'Approve & Set Fee',
    reject:            'Reject',
    setFee:            'Set Fee (₹)',
    confirmFee:        'Confirm Fee',
    markPaid:          'Mark as Paid',
    sendAnswer:        'Send Answer',
    askClarification:  'Ask Clarification',
    insertTemplate:    'Insert Template',
    insertRemedy:      'Insert Remedy',
    useVoice:          'Speak Answer',
    answerPlaceholder: 'Type the answer here...',
    deadline:          '48h deadline after payment',
    queriesNew:        'New',
    queriesPending:    'Pending',
    queriesAnswered:   'Answered',
    totalEarned:       'Total Earned',
    thisMonth:         'This Month',

    // Domains
    domain_career:      'Career & Job',
    domain_marriage:    'Marriage & Relationship',
    domain_daily_life:  'Day-to-Day Life',
    domain_baby_children: 'Baby & Children',
    domain_health:      'Health',
    domain_finance:     'Finance & Business',
    domain_education:   'Education',
    domain_property:    'Property & Vehicle',
    domain_travel:      'Travel & Foreign',
    domain_others:      'Others',

    // Remedy types
    remedy_gemstone:   'Gemstone',
    remedy_puja:       'Puja',
    remedy_mantra:     'Mantra',
    remedy_donation:   'Donation',
    remedy_fasting:    'Fasting',
    remedy_other:      'Other',

    // Misc
    payNow:            'Pay Now via UPI',
    paymentInstructions: 'Pay the fee and enter your UPI transaction ID below',
    transactionId:     'UPI Transaction ID / Reference',
    submitPayment:     'Submit Payment',
    noQueries:         'No queries yet',
    loading:           'Loading...',
    save:              'Save',
    cancel:            'Cancel',
    send:              'Send',
    delete:            'Delete',
    edit:              'Edit',
    search:            'Search',
    copyUpi:           'Copy UPI ID',
    copied:            'Copied!',
    querySubmitted:    'Query submitted! You will be notified once the fee is set.',
    paymentSubmitted:  'Payment submitted! Answer will arrive within 48 hours.',
    answerSent:        'Answer sent successfully!',
    hours48:           '48 hours remaining',
    overdue:           'OVERDUE',
    addTemplate:       'Add New Template',
    addRemedy:         'Add New Remedy',
    templateTitle:     'Template Title',
    templateContent:   'Template Content',
    tags:              'Tags (comma separated)',
  },

  mr: {
    // App
    appName:           'ज्योतिषकनेक्ट',
    tagline:           'विश्वासार्ह ज्योतिष सल्ला',
    switchLang:        'English',

    // Auth
    login:             'लॉगिन',
    logout:            'बाहेर पडा',
    register:          'नोंदणी करा',
    phoneNumber:       'फोन नंबर',
    name:              'तुमचे नाव',
    email:             'ईमेल (ऐच्छिक)',
    sendOtp:           'OTP पाठवा',
    verifyOtp:         'OTP सत्यापित करा',
    enterOtp:          '6-अंकी OTP टाका',
    otpSent:           'तुमच्या नंबरवर OTP पाठवला',
    newUser:           'खाते नाही?',
    existingUser:      'आधीच खाते आहे?',

    // Navigation
    myQueries:         'माझे प्रश्न',
    askQuery:          'प्रश्न विचारा',
    savedPersons:      'जतन केलेल्या व्यक्ती',
    profile:           'प्रोफाइल',
    dashboard:         'डॅशबोर्ड',
    queryInbox:        'प्रश्न इनबॉक्स',
    templates:         'टेम्पलेट्स',
    remedies:          'उपाय',

    // Query Form
    selectDomain:      'विषय निवडा',
    personDetails:     'व्यक्तीची माहिती',
    personName:        'व्यक्तीचे पूर्ण नाव',
    dob:               'जन्मतारीख',
    tob:               'जन्मवेळ',
    pob:               'जन्मस्थान',
    currentCity:       'सध्याचे शहर',
    gender:            'लिंग',
    male:              'पुरुष',
    female:            'स्त्री',
    other:             'इतर',
    relation:          'तुमच्याशी नाते',
    self:              'स्वतः',
    spouse:            'पती/पत्नी',
    child:             'मुलगा/मुलगी',
    parent:            'आई/वडील',
    sibling:           'भाऊ/बहीण',
    friend:            'मित्र/मैत्रीण',
    pastRemedies:      'आधी केलेले उपाय? (ऐच्छिक)',
    queryText:         'तुमचा प्रश्न',
    queryPlaceholder:  'तुमचा प्रश्न सविस्तर लिहा...',
    submitQuery:       'प्रश्न पाठवा',
    loadSavedPerson:   'जतन केलेली व्यक्ती लोड करा',
    saveThisPerson:    'ही व्यक्ती पुढील वापरासाठी जतन करा',

    // Status
    status_pending_review: 'तपासणी सुरू',
    status_fee_set:        'फी ठरवली — पेमेंट करा',
    status_paid:           'पेमेंट मिळाले',
    status_in_progress:    'उत्तर तयार होत आहे',
    status_clarification:  'अधिक माहिती हवी',
    status_answered:       'उत्तर दिले',
    status_closed:         'बंद',
    status_rejected:       'नाकारले',

    // Admin
    approve:           'मंजूर करा आणि फी ठरवा',
    reject:            'नाकारा',
    setFee:            'फी ठरवा (₹)',
    confirmFee:        'फी मंजूर करा',
    markPaid:          'पेमेंट झाले',
    sendAnswer:        'उत्तर पाठवा',
    askClarification:  'अधिक माहिती मागवा',
    insertTemplate:    'टेम्पलेट घाला',
    insertRemedy:      'उपाय घाला',
    useVoice:          'बोलून उत्तर द्या',
    answerPlaceholder: 'इथे उत्तर लिहा...',
    deadline:          'पेमेंटनंतर ४८ तासांची मुदत',
    queriesNew:        'नवीन',
    queriesPending:    'प्रलंबित',
    queriesAnswered:   'उत्तरित',
    totalEarned:       'एकूण कमाई',
    thisMonth:         'या महिन्यात',

    // Domains
    domain_career:       'करिअर आणि नोकरी',
    domain_marriage:     'विवाह आणि नाते',
    domain_daily_life:   'दैनंदिन जीवन',
    domain_baby_children:'बाळ आणि मुले',
    domain_health:       'आरोग्य',
    domain_finance:      'अर्थकारण आणि व्यवसाय',
    domain_education:    'शिक्षण',
    domain_property:     'मालमत्ता आणि वाहन',
    domain_travel:       'प्रवास आणि परदेश',
    domain_others:       'इतर',

    // Remedy types
    remedy_gemstone:   'रत्न',
    remedy_puja:       'पूजा',
    remedy_mantra:     'मंत्र',
    remedy_donation:   'दान',
    remedy_fasting:    'उपवास',
    remedy_other:      'इतर',

    // Misc
    payNow:            'UPI ने पेमेंट करा',
    paymentInstructions:'फी भरा आणि खाली UPI ट्रांझॅक्शन ID टाका',
    transactionId:     'UPI ट्रांझॅक्शन ID / संदर्भ',
    submitPayment:     'पेमेंट सबमिट करा',
    noQueries:         'अजून कोणतेही प्रश्न नाहीत',
    loading:           'लोड होत आहे...',
    save:              'जतन करा',
    cancel:            'रद्द करा',
    send:              'पाठवा',
    delete:            'हटवा',
    edit:              'संपादित करा',
    search:            'शोधा',
    copyUpi:           'UPI ID कॉपी करा',
    copied:            'कॉपी झाले!',
    querySubmitted:    'प्रश्न पाठवला! फी ठरल्यावर तुम्हाला कळवले जाईल.',
    paymentSubmitted:  'पेमेंट सबमिट केले! ४८ तासांत उत्तर मिळेल.',
    answerSent:        'उत्तर यशस्वीरित्या पाठवले!',
    hours48:           '४८ तास बाकी',
    overdue:           'मुदत संपली',
    addTemplate:       'नवीन टेम्पलेट जोडा',
    addRemedy:         'नवीन उपाय जोडा',
    templateTitle:     'टेम्पलेटचे शीर्षक',
    templateContent:   'टेम्पलेटचा मजकूर',
    tags:              'टॅग्स (स्वल्पविरामाने विभक्त)',
  }
}

export function t(lang: 'en' | 'mr', key: string): string {
  return translations[lang][key] ?? translations['en'][key] ?? key
}

export function domainLabel(lang: 'en' | 'mr', domain: QueryDomain): string {
  return t(lang, `domain_${domain}`)
}

export function statusLabel(lang: 'en' | 'mr', status: QueryStatus): string {
  return t(lang, `status_${status}`)
}

export function remedyLabel(lang: 'en' | 'mr', type: RemedyType): string {
  return t(lang, `remedy_${type}`)
}
