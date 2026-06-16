import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, X, MapPin } from 'lucide-react';

const locationData = {
  "Nairobi": {
    "Westlands": ["Kitisuru","Parklands","Highridge","Karura","Kangemi","Mountain View","Runda","Loresho","Muthaiga"],
    "Dagoretti North": ["Kilimani","Kawangware","Gatina","Kileleshwa","Kabiro","Lavington","Hurlingham"],
    "Dagoretti South": ["Mutu-ini","Ngando","Riruta","Uthiru","Waithaka","Kyuna"],
    "Langata": ["Karen","Nairobi West","Mugumo-ini","South C","Nyayo Highrise","Madaraka"],
    "Kibra": ["Laini Saba","Lindi","Makina","Woodley","Golf Course","Sarangombe","Kibera Slum"],
    "Roysambu": ["Githurai","Kahawa West","Zimmerman","Roysambu","Kahawa","Clay City","Marurui"],
    "Kasarani": ["Kasarani","Mwiki","Njiru","Ruai","Kamulu","Komarock"],
    "Ruaraka": ["Baba Dogo","Utalii","Mathare North","Lucky Summer","Korogocho","Kariobangi North"],
    "Mathare": ["Mathare Valley","Huruma","Mabatini","Gitathuru","Ofafa Jericho"],
    "Makadara": ["Maringo","Hamza","Viwandani","Makongeni","Buruburu","Imara Daima","Savannah"],
    "Kamukunji": ["Pumwani","Eastleigh North","Eastleigh South","Airbase","California","Kiambiu","Majengo"],
    "Starehe": ["Pangani","Ziwani","Kariokor","Landimawe","Nairobi South","Shauri Moyo","Ngara"],
    "Embakasi Central": ["Kayole North","Kayole South","Komarock","Matopeni","Spring Valley"],
    "Embakasi East": ["Upper Savannah","Lower Savannah","Embakasi","Utawala","Mihang'o"],
    "Embakasi North": ["Dandora I","Dandora II","Dandora III","Dandora IV","Kariobangi North"],
    "Embakasi South": ["Imara Daima","Kwa Njenga","Kwa Reuben","Pipeline","Kware"],
    "Embakasi West": ["Umoja I","Umoja II","Mowlem","Kariobangi South","Donholm"]
  },
  "Mombasa": {
    "Changamwe": ["Changamwe Town","Magongo","Mikindani","Airport North","Jomvu Kuu","Kipevu","Miritini","Shimanzi","Makupa"],
    "Jomvu": ["Jomvu Manda","Jomvu Kuu","Rabai Road","Mariakani Border","Kisauni Junction","Bombolulu West"],
    "Kisauni": ["Bamburi","Shanzu","Mtwapa Border","Kisauni Town","Bombolulu","Kongo","Junda","Mikindani North"],
    "Likoni": ["Likoni Ferry","Shelly Beach","Mtongwe","Timbwani","Bofu","Majengo Likoni","Shika Adabu","Voi Road Estates"],
    "Mvita": ["Mombasa CBD","Old Town","Tudor","Tononoka","Bondeni","Ganjoni","Majengo","Makadara Mombasa","Frere Town"],
    "Nyali": ["Nyali Beach","Links Road","Kongowea","Kadzandani","Mjomboni","Bamburi Beach","Reef Hotel Area","Mtambo"]
  },
  "Kwale": {
    "Kinango": ["Kinango Town","Mwavumbo","Gonjora","Makindu Kwale","Mlalo","Ndavaya","Kinyambo","Shimba Hills Market"],
    "Lungalunga": ["Lungalunga Town","Ramisi","Ushindi","Mwaluganje","Mto Wa Mbu","Kizurini","Vanga Border","Jimbo"],
    "Msambweni": ["Msambweni Town","Diani Beach","Ukunda","Tiwi","Gazi","Kongo","Mivumoni","Ramisi South","Mwanyanje"],
    "Matuga": ["Matuga Town","Kwale Town","Samburu Kwale","Kombani","Pongwe","Mzambarauni","Mwaluphamba","Kinondo Junction"]
  },
  "Kilifi": {
    "Kaloleni": ["Kaloleni Town","Jibana","Nyalani","Mavueni","Kamba","Chasimba","Matsangoni","Gongoni"],
    "Kilifi North": ["Kilifi Town","Mtwapa","Kikambala","Vipingo","Kanamai","Tezo","Majengo Kilifi","Mnarani"],
    "Kilifi South": ["Chonyi","Ganze","Mombasa Road Trading Centres","Kisauni Border","Bofa Beach","Shariani"],
    "Malindi": ["Malindi Town","Watamu","Gedi","Mambrui","Che Shale","Kipepeo","Kakuyuni","Marafa Hell's Kitchen"],
    "Rabai": ["Rabai Town","Mazeras","Roka","Kauma","Mwawesa","Mwachi","Kisimani","Gongoni North"]
  },
  "Tana River": {
    "Bura": ["Bura Town","Bura Irrigation Scheme","Nanighi","Madogo","Hiriman","Dadaab Border","Maziwa"],
    "Galole": ["Galole Town","Hola","Gwanza","Mbalambala","Tarasaa","Mlima Nzuri","Kipini North"],
    "Garsen": ["Garsen Town","Kipini","Oda","Witu","Kau","Minjila","Ngatana","Mpeketoni Border"]
  },
  "Lamu": {
    "Lamu East": ["Lamu Island Old Town","Shela","Manda Island","Kizingitini","Faza","Pate","Siyu","Kipungani"],
    "Lamu West": ["Mokowe","Hindi","Mpeketoni","Witu Border","Kiangwe","Nyuni","Basuba","Mararani"]
  },
  "Taita-Taveta": {
    "Mwatate": ["Mwatate Town","Bura Taita","Chawia","Mgange","Kishushe","Mghange","Kinyambu"],
    "Taveta": ["Taveta Town","Holili Border","Chala Lake","Bomani","Mrabani","Kibigori","Njoro Taveta"],
    "Voi": ["Voi Town","Tsavo East Gate","Maungu","Ndara","Mbololo","Sagala","Kasigau Road"],
    "Wundanyi": ["Wundanyi Town","Mbale","Mwachora","Kishushe South","Mghange West","Kilema"]
  },
  "Garissa": {
    "Balambala": ["Balambala Town","Modogashe","Gurufa","Dadaab South","Liboi Road Centres"],
    "Dadaab": ["Dadaab Refugee Complex","Dagahaley","Ifo","Hagadera","Dadaab Market","Bulo Giche"],
    "Fafi": ["Fafi Town","Bulo Wacho","Eldere","Dadaab North","Jidhim"],
    "Garissa Township": ["Garissa CBD","Alinur","Bilal","Township Estates","Modogashe Junction","Garissa University Area"],
    "Hulugho": ["Hulugho Town","Bulo Bana","Danyere","Lagdera Border"],
    "Ijara": ["Ijara Town","Masalani","Korokoro","Kau","Bura Tana River Border"],
    "Lagdera": ["Lagdera Town","Modogashe East","Shantaback","Gurufu South"]
  },
  "Wajir": {
    "Eldas": ["Eldas Town","Bulo Kebe","Hadado","Wajir North Border"],
    "Tarbaj": ["Tarbaj Town","Bulo Gura","Dif","Habaswein Border"],
    "Wajir East": ["Wajir CBD East","Bulo Burto","Matani","Hadado East"],
    "Wajir North": ["Wajir North Town","Bulo Doyo","Arbajahan","Dif North"],
    "Wajir South": ["Wajir South","Habaswein","Bulo Sheikh","Lagdera Border"],
    "Wajir West": ["Wajir CBD West","Bulo Giche","Giriftu","Modogashe West"]
  },
  "Mandera": {
    "Banissa": ["Banissa Town","Arabia Border","Bulo Hawa","Dhamasa"],
    "Lafey": ["Lafey Town","Fino","Bulo Makori","Mandera North Border"],
    "Mandera East": ["Mandera CBD","El Wak Road","Township Estates","Bulo Mari"],
    "Mandera North": ["Mandera North","Rhamu","Bulo Dibi","Somalia Border Markets"],
    "Mandera South": ["Mandera South","Takaba","Bulo Gura","Lafey South"],
    "Mandera West": ["Mandera West","El Wak","Bulo Adan","Banissa East"]
  },
  "Marsabit": {
    "Laisamis": ["Laisamis Town","Kargi","Meru Border","Logologo","Samburu Junction"],
    "Moyale": ["Moyale Town","Ethiopia Border","Sololo","Turbi","Dabel","Choroo"],
    "North Horr": ["North Horr Town","Kalacha","Maikona","Bubisa","Loyangalani Border"],
    "Saku": ["Marsabit Town","Karare","Jaldesa","Gabra Market","Marsabit National Park Centres"]
  },
  "Isiolo": {
    "Garbatulla": ["Garbatulla Town","Oldonyiro","Serolevi","Borana Markets","Shura"],
    "Isiolo": ["Isiolo CBD","Kinna","Leparua","Kipsing","Meru Border Trading Hubs"],
    "Merti": ["Merti Town","Cherab","Illaut","Ewaso Nyiro North Settlements"]
  },
  "Meru": {
    "Buuri": ["Buuri Town","Timau","Nanyuki Border","Kibirichia","Ruiri","Kiru"],
    "Igembe Central": ["Maua","Mutuati","Amwathi","Giaki","Katheri"],
    "Igembe North": ["Laare","Nkubu","Mwireri","Kianjai","Muthara"],
    "Igembe South": ["Mitunguu","Mwakurathia","Kibugua","Nchiru"],
    "Imenti North": ["Meru Town CBD","Kianjiru","Muthurwa","Kanyakine","Gatimbi"],
    "Imenti South": ["Chuka Border","Nkene","Kithaku","Mwitu","Mikinduri"],
    "Imenti West": ["Kangeta","Kibirichia West","Kiirua","Ruiri West"],
    "Tigania East": ["Mikinduri","Mutuati East","Kithuuri","Muriri"],
    "Tigania West": ["Urua","Kilele","Mbeu","Kigongoi"]
  },
  "Tharaka-Nithi": {
    "Maara": ["Chuka Town","Ishiara","Kibugua","Muthara","Kiangoci"],
    "Meru South": ["Muthambi","Katheri South","Giaki West","Nchiru Border"],
    "Tharaka North": ["Marimanti","Gatunga","Tharaka Town","Kamanyaki"],
    "Tharaka South": ["Nkubu South","Kithangani","Igembe Border Markets"]
  },
  "Embu": {
    "Manyatta": ["Embu CBD","Manyatta Market","Kianjokoma","Muthurwa","Gatunduri"],
    "Mbeere North": ["Siakago","Kiritiri","Gichera","Mutuobare","Ishiara Border"],
    "Mbeere South": ["Kamburu","Mutomo","Mavuria","Kiambere","Irangi"],
    "Runyenjes": ["Runyenjes Town","Karurumo","Kianjiru Embu","Nthawa","Mukuuri"]
  },
  "Kitui": {
    "Kitui Central": ["Kitui CBD","Mutomo Junction","Kwa Vonza","Matuu Road","Muthale"],
    "Kitui East": ["Mutomo","Kibwezi Border","Ikutha","Kanziko","Nzambani"],
    "Kitui West": ["Matuu","Kalundu","Kithui","Mbitini","Kwa Mutua"],
    "Mwingi Central": ["Mwingi Town","Kyuso","Kwa Musembi","Migwani"],
    "Mwingi East": ["Migwani East","Nuu","Mutomo North","Kanziko West"],
    "Mwingi West": ["Kyuso West","Mumoni","Tseikuru","Muthale West"]
  },
  "Machakos": {
    "Athi River": ["Athi River Town","Daystar","Lukenya","Koma Rock","Mlolongo Border","Syokimau"],
    "Machakos Central": ["Machakos CBD","Tala","Mua Hills","Kwa Mutua","Kaloleni Machakos"],
    "Masinga": ["Masinga Town","Yatta Dam","Kithimani","Mbithi","Kyeleni"],
    "Matungulu": ["Matungulu Town","Kangundo Road","Kwa Mbithi","Ngelani","Kithimani Border"],
    "Yatta": ["Kithimani","Iveti","Mavoko Border","Muthwani","Kwa Vonza Machakos"]
  },
  "Makueni": {
    "Kibwezi East": ["Kibwezi Town","Makindu","Chyulu","Kilema","Mtito Andei"],
    "Kibwezi West": ["Makindu West","Tsavo Border","Kwa Mbithi","Mutomo South"],
    "Makueni": ["Wote Town","Kako","Muvuti","Kalamba","Nziu"],
    "Mbooni": ["Mbooni Town","Tulia","Kathonzweni","Kwa Mutua","Mavindu"],
    "Mutomo": ["Mutomo Makueni","Ikutha West","Kanziko South","Nzambani Makueni"]
  },
  "Nyandarua": {
    "Kinangop": ["Kinangop Town","Njabini","Engineer","Magumu","Githabai","Kipipiri Border"],
    "Kipipiri": ["Kipipiri Town","Miharati","Muhuro","Kwa Hinga","Ol Kalou North"],
    "Ol Kalou": ["Ol Kalou Town","Karangi","Nyeri Border","Kaimbaga","Mawingu"],
    "Ol Jorok": ["Ol Jorok Town","Ndithia","Kipkelion Border","Magumu West","Githabai South"]
  },
  "Nyeri": {
    "Kieni East": ["Naromoru","Chaka","Mutathiini","Timau Border","Kiganjo Nyeri"],
    "Kieni West": ["Mweiga","Kabazi Nyeri","Wamagana","Ol Kalou Border"],
    "Mathira": ["Karatina Town","Kirinyaga Border","Kimbimbi","Githithi","Muthuaini"],
    "Mwea": ["Wanguru","Thiba","Karaba","Mwea Rice Scheme","Sagana"],
    "Nyeri Central": ["Nyeri CBD","Ruring'u","Kamakwa","Mathari","Kiganjo"],
    "Tetu": ["Tetu Town","Ihururu","Kabare","Dedan Kimathi Shrine","Mweiga Border"]
  },
  "Kirinyaga": {
    "Kirinyaga Central": ["Kerugoya Town","Kutus","Kagio","Muthurwa","Gichugu"],
    "Mwea East": ["Wanguru East","Thiba East","Karaba East","Sagana Border"],
    "Mwea West": ["Mwea West Rice Scheme","Kiamaina","Karaba West","Kirinyaga Border"],
    "Ndia": ["Gichugu Town","Kibingoti","Kabare Kirinyaga","Mathira Border"]
  },
  "Murang'a": {
    "Gatanga": ["Gatanga Town","Thika Border","Kakuzi","Githioro","Kihunguro Murang'a"],
    "Kandara": ["Kandara Town","Kahuro","Kwa Njoki","Githumu","Maragua North"],
    "Kigumo": ["Kigumo Town","Muruka","Kiharu","Nyeri Border Markets"],
    "Maragua": ["Maragua Town","Muruka South","Kwa Kamau","Kigumo Border"],
    "Murang'a East": ["Murang'a CBD","Githumu East","Kahuro East","Kiambo"],
    "Murang'a South": ["Kiria-ini","Kiharu South","Gatanga Border Trading Centres"]
  },
  "Kiambu": {
    "Thika Town": ["Thika CBD","Ngoingwa","Bendor","Gatuanyaga","Maguguni","Kiganjo","Muthurwa","Ruiru Border","Thika Greens","Ndakaini Road trading centres","Majengo","Ofafa","Biafra","Maporomoko","Makongeni Phase 6","Makongeni Phase 7","Makongeni Phase 10","Makongeni Phase 11","Makongeni Phase 12","Makongeni Phase 13","Kiang'ombe","Kiandutu","Kisii Estate","Athena","Mkira","Wahome","Biashara","Umoja","Molo Village","Kianjau","Kivulini","Salama","Landless","Muslim Village","Gachagi","Madharau"],
    "Juja": ["Juja CBD","JKUAT Main Campus","Juja City Mall","Juja Market","Kenyatta Road Estates","Nairobi Business Park","Pulp & Paper Industrial Area","Star Plastics","Hydro Aluminium","Woodland Academy","Kwa Muigai","Mwihoko Juja fringe","Witeithie Township","Witeithie Market","New Witeithie Market","Komo","Mang'u High School environs","Thika Power Station","Vincentian Retreat Centre","Kihingo","Mutonguni","Kwa Wairimu","Mwireri","Kalimoni Town","Kalimoni Mission Hospital","Kalimoni Primary","Ndarugu Valley","Gatundu Road trading hubs","Kwa Ngugi","Murathani","Murera Township","Murera Sisal Farm","Murera Coffee Plantations","Matangi-ini","Ndarasha","GSU Murera Camp","Kwa Mbithi","Gwa Kairu-Murera Road junction","Theta Village","Theta Market","Kwa Thuo","Kihunguro","Muthua","Kiambo","Karuri"],
    "Ruiru": ["Ruiru CBD","Ruiru Market","Ruiru Post Office","Ruiru Level 4 Hospital","Bidco Industrial Park","Devki Steel Mills","Ruiru Mabati Factory","Kamakis","Eastern Bypass junction","Spurr Mall","Kamakis residential blocks","Tatu City","Kijani Ridge","Unity Homes","Lifestyle Heights","Tatu Industrial Park","Crawford International School","Membley","Membley Estate","Membley Shopping Centre","Mwihoko","Mwihoko Estate","Mwihoko Market","Sukari Mwihoko","Kahawa Sukari","Kahawa Sukari Township","Sukari Market","Kimbo","Ruiru-Kimbo industrial zone","Githurai 45","Varsity Ville","Northlands City","Gwa Kairu","Gwa Kairu Stage","Vipe Fun Park","St Julia Primary","Lily Gold Plaza","Kihunguro","Kihunguro Secondary School","Kihunguro Stadium"],
    "Gatundu South": ["Ng'enda","Kiamwangi","Kiganjo","Ndarugu"],
    "Gatundu North": ["Gituamba","Kiambaa","Mang'u","Chaka","Gatundu"],
    "Kiambaa": ["Kiambaa","Cianda","Karuri","Ndenderu","Muchatha","Kihara"],
    "Kabete": ["Gitaru","Muguga","Nyathuna","Uthiru/Ruthimitu"],
    "Kikuyu": ["Karai","Kikuyu","Sigona","Nachu"],
    "Limuru": ["Bibirioni","Limuru Central","Ndeiya","Ngecha","Tigoni"],
    "Lari": ["Kirenga","Lari/Kirenga","Kijabe","Nyanduma","Kamburu","Lari"],
    "Kiambu": ["Ting'ang'a","Ngemba","Ndumberi","Riabai","Township"]
  },
  "Turkana": {
    "Kakuma": ["Kakuma Refugee Camp","Kakuma Town","Lopiding","Kalobeyei"],
    "Kibish": ["Kibish Town","Ethiopia Border","Oropoi","Lokitaung South"],
    "Lodwar": ["Lodwar CBD","Lokichar","Lokori","Turkwel","Kanamkemer"],
    "Loima": ["Loima Town","Lokitaung","Lapur","Kachoda","Turkana West"],
    "Turkana Central": ["Kaikor","Kangakoth","Lodwar Border Centres"],
    "Turkana East": ["Katilu","Napak","Lokiriama","Uganda Border Markets"],
    "Turkana North": ["Lorengippi","Napeitom","Oropoi North","Kibish Border"]
  },
  "West Pokot": {
    "Chepareria": ["Chepareria Town","Sigor","Kacheliba","Uganda Border","Lelan"],
    "Pokot Central": ["Kapenguria CBD","Makutano","Pochalla","Kipkomo"],
    "Pokot North": ["Alale","Kacheliba North","Lokichogio Border","Lelan West"],
    "Pokot South": ["Sigor South","Kipkomo South","Kapenguria South Trading Hubs"]
  },
  "Samburu": {
    "Baragoi": ["Baragoi Town","Suguta Valley","Loyangalani Border","Laisamis South"],
    "Maralal": ["Maralal CBD","Lerata","Wamba","Kisima","Isiolo Border"],
    "Samburu East": ["Wamba East","Kisima East","Ngare Mara","Meru Border"],
    "Samburu West": ["Lerata West","Baragoi South","Suguta South Markets"]
  },
  "Trans Nzoia": {
    "Cherangany": ["Cherangany Town","Kapsara","Kapcherop","Kiptulwa","Eldoret Border"],
    "Endebess": ["Endebess Town","Mount Elgon Foot","Chepchoina","Uganda Border"],
    "Kiminini": ["Kiminini Town","Kitale CBD","Kachibora","Makutano Trans Nzoia"],
    "Kwanza": ["Kwanza Town","Kapomboi","Kipsaina","Eldoret North Border"],
    "Saboti": ["Saboti Town","Kapsowar","Lelan Border","Kachibora South"]
  },
  "Uasin Gishu": {
    "Ainabkoi": ["Eldoret CBD","Huruma","Langas","Kapsoya","Kipkaren"],
    "Kapseret": ["Kapseret Town","Langas East","Kipkaren South","Moiben Border"],
    "Kesses": ["Kesses Town","Kipchirchir","Tarakwa","Turbo Border"],
    "Moiben": ["Moiben Town","Kaptagat","Chepkoilel","Ainabkoi North"],
    "Soy": ["Soy Town","Ziwa","Kipkaren North","Kapseret North"],
    "Turbo": ["Turbo Town","Moi's Bridge","Kipkelion Border","Uganda Road Markets"]
  },
  "Elgeyo-Marakwet": {
    "Keiyo North": ["Iten Town","Chepkorio","Kaptagat Border","Kapcherop"],
    "Keiyo South": ["Kapsowar","Chepkoilel South","Kipchirchir","Eldoret Border"],
    "Marakwet East": ["Keringet Marakwet","Chesongoch","Kerio Valley","Tot"],
    "Marakwet West": ["Tot West","Chesegon","Endebess Border","Kapcherop West"]
  },
  "Nandi": {
    "Aldai": ["Aldai Town","Kipkelion Border","Kabiyet","Kapsabet North"],
    "Chesumei": ["Chesumei Town","Kipkaren Nandi","Ziwa Border","Mosop South"],
    "Kapsabet": ["Kapsabet CBD","Kabiyet South","Kipchirchir Nandi","Nandi Hills Border"],
    "Mosop": ["Mosop Town","Salgaa Nandi","Rongai Border","Kabiyet West"],
    "Nandi Hills": ["Nandi Hills Town","Kipkaren South","Aldai South","Kapsabet East"]
  },
  "Baringo": {
    "Baringo Central": ["Kabarnet Town","Salawa","Kapropita","Lake Baringo Markets"],
    "Baringo North": ["Marigat","Loboi","Kampi Ya Samaki","Tiaty Border"],
    "Baringo South": ["Mochongoi","Ol Kokwe","Lake Bogoria","Mogotio North"],
    "Eldama Ravine": ["Eldama Ravine Town","Lembus","Kuresoi Border","Sachangwan"],
    "Mogotio": ["Mogotio Town","Ol Arabel","Kipkelion Border","Baringo South West"],
    "Tiaty": ["Tiaty Town","Chemolingot","Katum","Uganda Border Trading Centres"]
  },
  "Laikipia": {
    "Laikipia Central": ["Nanyuki CBD","Ol Pejeta","Timau Border","Kijabe Road"],
    "Laikipia East": ["Rumuruti","Pesi","Isiolo Border","Maralal South"],
    "Laikipia North": ["Mpala","Lolldaiga","Samburu Border","Baragoi South"],
    "Laikipia West": ["Nyahururu Town","Ol Jorok Border","Kinangop","Thomson's Falls"]
  },
  "Nakuru": {
    "Bahati": ["Maili Kumi","Kabatini","Dundori","Bahati Township","Kirogo","Gichora","Kiratina","Ndondori","Mbarathi"],
    "Gilgil": ["Gilgil","Elementaita","Eburu","Murindati","Malewa","Kariandusi","Kinyany","Olchorro","Nyakinyua"],
    "Kuresoi North": ["Keringet","Taita","Siriat","Sinendet","Sigotik","Chepkero","Kamara","Kiptangwanyi","Olenguruone North"],
    "Kuresoi South": ["Molo Tisa","Sachangwan","Chepseon","Kamorito","Lembus","Kiptulwa","Tachasis","Kaplong","Marioshoni South"],
    "Molo": ["Molo","Olenguruone","Marioshoni","Elburgon","Turi","Mau Narok","Nessuit","Lare","Kihingo","Mauche"],
    "Naivasha": ["Naivasha","Mai Mahiu","Olkaria","Hells Gate","Maiella","Lake View","Biashara","Viwandani","Kongoni","Longonot","Karati","Malewa West"],
    "Nakuru Town East": ["Nakuru City CBD","Lanet","Free Area","Shabab","Kiamunyi","Rhoda","Pwani","Pipeline","Kivumbini","Flamingo"],
    "Nakuru Town West": ["Nakuru City CBD","Menengai","London","Barut","Racecourse","Kwa Njoki","Kapkures","Kaptembwa","Poiywek"],
    "Njoro": ["Njoro","Mau Narok Town","Mauche","Lare","Kihingo","Nessuit","Egerton","Mwichiu","Mweru","Keringeti"],
    "Rongai": ["Rongai","Solai","Salgaa","Soin","Visoi","Mosop","Menengai West","Degaulle","Kipteris","Moi Ndabi"],
    "Subukia": ["Subukia","Kabazi","Mutumaini","Kiptaragwa","Karima","Nyawita","Kinyua","Kirima","Mwatate","Gichuru"]
  },
  "Narok": {
    "Narok East": ["Narok Town CBD","Sogoo","Ololulunga","Maasai Mara Gate"],
    "Narok North": ["Ngosuani","Ol Chorro Oiro","Gilgil Border","Elementaita South"],
    "Narok South": ["Ololulunga South","Mara North Conservancy","Talek","Keekorok"],
    "Narok West": ["Ngosuani West","Sogoo West","Molo Border","Olenguruone South"],
    "Transmara East": ["Kilgoris","Lolgorien","Mara River","Kijabi"],
    "Transmara West": ["Lolgorien West","Kijabi West","Kisii Border","Migori North"]
  },
  "Kajiado": {
    "Isinya": ["Isinya Town","Kiserian Border","Kitengela South","Olkejuado"],
    "Kajiado Central": ["Kajiado Town","Olodo","Namanga Road","Kiserian South"],
    "Kajiado North": ["Kitengela","Kiserian","Ngong","Oloolua","Nairobi Border Estates"],
    "Loitokitok": ["Loitokitok Town","Namanga Border","Amboseli Gate","Emali"],
    "Mashuuru": ["Mashuuru Town","Emali West","Tsavo Border","Kibwezi North"]
  },
  "Kericho": {
    "Ainamoi": ["Kericho CBD","Kapsoit","Cheplanget","Tea Plantation Centres"],
    "Belgut": ["Belgut Town","Kabianga","Kipkelion Border","Sigowet South"],
    "Bureti": ["Litein Town","Kaptagat Kericho","Kabianga South","Ainamoi West"],
    "Kipkelion East": ["Londiani","Kipkelion Town","Molo Border","Sachangwan East"],
    "Kipkelion West": ["Kipkelion West","Kabiyet Kericho","Nandi Border","Salgaa South"],
    "Soin/Sigowet": ["Sigowet Town","Soin","Kabianga North","Belgut East"]
  },
  "Bomet": {
    "Bomet Central": ["Bomet CBD","Sigor Bomet","Kembu","Sotik North"],
    "Bomet East": ["Longisa","Kembu East","Kisii Border","Nyamira North"],
    "Chepalungu": ["Chepalungu Town","Sotik Border","Konoin South","Migori North"],
    "Konoin": ["Konoin Town","Kimulot","Chepalungu North","Bomet Central West"],
    "Sotik": ["Sotik Town","Kaplong","Marioshoni Border","Nakuru South West"]
  },
  "Kakamega": {
    "Butere": ["Butere Town","Lurambi Border","Kholera","Nambale Border"],
    "Kakamega Central": ["Kakamega CBD","Lurambi","Shinyalu","Kakamega Forest Gate"],
    "Kakamega East": ["Shinyalu East","Kipchamo","Vihiga Border","Hamisi North"],
    "Kakamega North": ["Malava North","Kabras East","Shikutse","Bungoma Border"],
    "Kakamega South": ["Lurambi South","Kholera South","Butere Border Markets"],
    "Malava": ["Malava Town","Kabras West","Shikutse","Vihiga North Border"],
    "Matungu": ["Matungu Town","Nambale Border","Busia South","Butere West"]
  },
  "Vihiga": {
    "Emuhaya": ["Emuhaya Town","Muyesu","Kima","Kakamega Border"],
    "Hamisi": ["Hamisi Town","Shaviringa","Tiriki East","Malava Border"],
    "Luanda": ["Luanda Town","Majengo Vihiga","Muyesu South","Sabatia North"],
    "Sabatia": ["Sabatia Town","Kibigori","Tiriki West","Vihiga CBD Border"],
    "Vihiga": ["Vihiga CBD","Mbale","Kima South","Hamisi South"]
  },
  "Bungoma": {
    "Bumula": ["Bumula Town","Uganda Border","Nambale North","Busia Border"],
    "Kabuchai": ["Kabuchai Town","Sirisia South","Kimilili Border","Malava North"],
    "Kanduyi": ["Bungoma CBD","Kanduyi Market","Webuye Border","Kapsokwony Road"],
    "Kimilili": ["Kimilili Town","Mt Elgon South","Endebess Border","Chepchoina"],
    "Mt Elgon": ["Cheptais","Kapchorwa Uganda Border","Kimilili North","Sirisia West"],
    "Sirisia": ["Sirisia Town","Kabuchai North","Bungoma West","Tongaren Border"],
    "Tongaren": ["Tongaren Town","Chesamisi","Kapsokwony","Trans Nzoia Border"],
    "Webuye East": ["Webuye Town East","Misikhu","Kanduyi West","Tongaren South"],
    "Webuye West": ["Webuye West","Misikhu West","Bumula Border","Busia North"]
  },
  "Busia": {
    "Budalangi": ["Budalangi Town","Lake Victoria Shore","Port Victoria","Funyula Border"],
    "Butula": ["Butula Town","Malaba Border","Uganda Customs","Nambale North"],
    "Funyula": ["Funyula Town","Budalangi South","Lake Victoria Markets","Matayos West"],
    "Matayos": ["Matayos Town","Nambale South","Kakamega Border","Butula West"],
    "Nambale": ["Nambale Town","Bumula Border","Matayos North","Busia CBD"],
    "Teso North": ["Amagoro","Malaba North","Uganda Teso Border","Busia North"],
    "Teso South": ["Ang'urai","Busia CBD","Teso North Border","Matayos East"]
  },
  "Siaya": {
    "Alego Usonga": ["Usonga Town","Siaya CBD","Nyagare","Bondo Border"],
    "Bondo": ["Bondo Town","Lake Victoria","Sindo","Suba Border","Mfangano Ferry"],
    "Gem": ["Yala Town","Nyawita","Alego Border","Ugenya South"],
    "Rarieda": ["Rarieda Town","Ndori","Asembo Bay","Lake Victoria Trading Centres"],
    "Ugenya": ["Ugenya Town","Ukwala Border","Sigomre","Yala North"],
    "Ukwala": ["Ukwala Town","Sigomre South","Ugenya West","Busia Border"]
  },
  "Kisumu": {
    "Kisumu Central": ["Kisumu CBD","Milimani","Manyatta","Migosi","Obunga"],
    "Kisumu East": ["Manyatta East","Nyawita","Muhoroni Border","Kajulu"],
    "Kisumu West": ["Mamboleo","Manyatta West","Seme Border","Otonglo"],
    "Muhoroni": ["Muhoroni Town","Chemelil","Nyando Border","Sugar Plantation Centres"],
    "Nyando": ["Awasi","Kano","Nyando Town","Muhoroni South","Kisumu East Border"],
    "Seme": ["Seme Town","Otonglo West","Mamboleo Border","Bondo North"]
  },
  "Homa Bay": {
    "Homa Bay": ["Homa Bay CBD","Mbita","Mfangano Ferry","Lake Victoria Shore Markets"],
    "Kabondo Kasipul": ["Kabondo Town","Kasipul","Rongo Border","Migori North"],
    "Ndhiwa": ["Ndhiwa Town","Homabay South","Kanyadoto","Migori Border"],
    "Rangwe": ["Rangwe Town","Kendu Bay","Karachuonyo","Homa Bay North"],
    "Rongo": ["Rongo Town","Kabondo South","Kisii Border","Nyamira South"],
    "Suba Central": ["Sindo","Mfangano Island","Mbita Border","Bondo South"],
    "Suba South": ["Kaksingri","Karachuonyo South","Rangwe West","Lake Victoria Hamlets"]
  },
  "Migori": {
    "Awendo": ["Awendo Town","Sugar Plantations","Rongo Border","Kisii South"],
    "Kuria East": ["Kehancha Town","Tanzania Border","Mabera","Kuria West Border"],
    "Kuria West": ["Mabera West","Isebania Border","Migori South","Kehancha North"],
    "Migori": ["Migori CBD","Onyalo","Suna Border","Nyatike North"],
    "Nyatike": ["Nyatike Town","Macalder Mines","Lake Victoria Shore","Homa Bay South"],
    "Suna East": ["Suna East","Onyalo East","Migori CBD Border","Awendo North"],
    "Suna West": ["Suna West","Kakrao","Kuria Border","Migori West"]
  },
  "Nyamira": {
    "Borabu": ["Borabu Town","Sotik Border","Kisii North","Bomet East"],
    "Manga": ["Manga Town","Nyamira South","Kisii Border","Rongo North"],
    "Nyamira North": ["Nyamira CBD North","Borabu East","Kisii North West"],
    "Nyamira South": ["Nyamira CBD South","Manga North","Rongo Border Markets"]
  },
  "Kisii": {
    "Kisii Central": ["Jogoo Estate","Daraja Moja","Daraja Mbili","Moi Ambani Mashariki","Gusii Stadium","Nyang'wa","Nyamataro","Milimani","Nyanchwa","Mwembe","Egesa","Getare","Nyamage","Nyambera","Kisii Main CBD","Mosocho","Nyasore","Rionchogu"],
    "Kisii South": ["Nyamagwa","Masimba","Manga","Kegati"],
    "Kisii West": ["Ogembo","Tabaka","Gucha","Nyakoe"],
    "Kisii North": ["Marani","Birongo","Nyanturago","Sensi"],
    "Bobasi": ["Bobasi","Bonyadundo","Nyasibi","Ronge"],
    "Bomachoge Chache": ["Borabu","Chache","Nyamache","Gekano"],
    "Bomachoge Borabu": ["Rigoma","Nyamarambe","Kenyenya","Gesusu"],
    "Nyaribari Masaba": ["Masaba","Nyachae","Nyaguta","Magenche"]
  }
};

const propertyTypes = ["All Types","Apartment","Bedsitter","Single Room","Studio","Townhouse","Villa","Commercial","Hostel","Shared"];

export default function CountyFilterBar({ onFilterChange }: { onFilterChange: (filters: any) => void }) {
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [selectedSubcounty, setSelectedSubcounty] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [propertyType, setPropertyType] = useState("All Types");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);
  const scrollRef = useRef<<HTMLDivElement>(null);

  const counties = Object.keys(locationData);

  const subcounties = selectedCounty ? Object.keys(locationData[selectedCounty] || {}) : [];
  const wards = (selectedCounty && selectedSubcounty) ? (locationData[selectedCounty]?.[selectedSubcounty] || []) : [];

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -400 : 400, behavior: 'smooth' });
    }
  };

  const handleCountySelect = (county: string) => {
    const newCounty = selectedCounty === county ? null : county;
    setSelectedCounty(newCounty);
    setSelectedSubcounty(null);
    setSelectedWard(null);
    setShowCountyDropdown(false);
  };

  const handleSubcountySelect = (subcounty: string) => {
    setSelectedSubcounty(subcounty === selectedSubcounty ? null : subcounty);
    setSelectedWard(null);
  };

  const handleWardSelect = (ward: string) => {
    setSelectedWard(ward === selectedWard ? null : ward);
  };

  const clearAll = () => {
    setSelectedCounty(null);
    setSelectedSubcounty(null);
    setSelectedWard(null);
    setPropertyType("All Types");
    setMinPrice("");
    setMaxPrice("");
  };

  useEffect(() => {
    onFilterChange({
      county: selectedCounty || undefined,
      subcounty: selectedSubcounty || undefined,
      ward: selectedWard || undefined,
      property_type: propertyType !== "All Types" ? propertyType : undefined,
      min_price: minPrice ? parseInt(minPrice) : undefined,
      max_price: maxPrice ? parseInt(maxPrice) : undefined,
    });
  }, [selectedCounty, selectedSubcounty, selectedWard, propertyType, minPrice, maxPrice]);

  return (
    <div className="w-full space-y-4">
      <div className="relative flex items-center gap-2 bg-dark-800 rounded-2xl border border-dark-700 p-2">
        <button onClick={() => scroll('left')} className="shrink-0 p-1.5 rounded-full bg-dark-700 text-dark-400 hover:text-white hover:bg-dark-600 transition-colors">
          <ChevronLeft size={18} />
        </button>

        <div ref={scrollRef} className="flex gap-2 overflow-x-auto py-1 px-1 flex-1" style={{ scrollbarWidth: 'none' }}>
          {counties.map((county) => (
            <button key={county} onClick={() => handleCountySelect(county)}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${selectedCounty === county ? 'bg-green-600 text-white shadow-lg shadow-green-900/30' : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white'}`}>
              {county}
            </button>
          ))}
        </div>

        <button onClick={() => scroll('right')} className="shrink-0 p-1.5 rounded-full bg-dark-700 text-dark-400 hover:text-white hover:bg-dark-600 transition-colors">
          <ChevronRight size={18} />
        </button>

        <div className="relative shrink-0 border-l border-dark-600 pl-2">
          <button onClick={() => setShowCountyDropdown(!showCountyDropdown)} className="p-2 rounded-xl bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white transition-colors">
            <ChevronDown size={18} className={`transition-transform ${showCountyDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showCountyDropdown && (
            <div className="absolute right-0 top-full mt-2 w-64 max-h-80 overflow-y-auto bg-dark-900 border border-dark-700 rounded-xl shadow-2xl z-50 p-2">
              <div className="grid grid-cols-1 gap-1">
                {counties.map((county) => (
                  <button key={county} onClick={() => handleCountySelect(county)}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCounty === county ? 'bg-green-600/20 text-green-400 font-medium' : 'text-dark-300 hover:bg-dark-800'}`}>
                    {county}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select value={selectedSubcounty || ''} onChange={(e) => handleSubcountySelect(e.target.value || null)}
            disabled={!selectedCounty} className="appearance-none bg-dark-800 text-dark-300 border border-dark-700 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-green-500 disabled:opacity-40 disabled:cursor-not-allowed min-w-[150px]">
            <option value="">Subcounty</option>
            {subcounties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select value={selectedWard || ''} onChange={(e) => handleWardSelect(e.target.value || null)}
            disabled={!selectedSubcounty} className="appearance-none bg-dark-800 text-dark-300 border border-dark-700 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-green-500 disabled:opacity-40 disabled:cursor-not-allowed min-w-[150px]">
            <option value="">Ward / Town</option>
            {wards.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="appearance-none bg-dark-800 text-dark-300 border border-dark-700 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-green-500 min-w-[150px]">
            {propertyTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 pointer-events-none" />
        </div>

        <input type="number" placeholder="Min KSh" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
          className="bg-dark-800 text-dark-300 border border-dark-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 w-[120px] placeholder-dark-500" />

        <input type="number" placeholder="Max KSh" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
          className="bg-dark-800 text-dark-300 border border-dark-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 w-[120px] placeholder-dark-500" />

        <button onClick={clearAll} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-900/20 text-red-400 hover:bg-red-900/30 hover:text-red-300 text-sm font-medium transition-colors border border-red-900/30">
          <X size={14} /> Clear
        </button>
      </div>

      {(selectedCounty || selectedSubcounty || selectedWard || propertyType !== "All Types" || minPrice || maxPrice) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-dark-500">Active:</span>
          {selectedCounty && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-900/30 text-green-400 text-xs border border-green-800"><MapPin size={12} />{selectedCounty}<button onClick={() => setSelectedCounty(null)} className="hover:text-white ml-1"><X size={12} /></button></span>}
          {selectedSubcounty && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-900/30 text-blue-400 text-xs border border-blue-800">{selectedSubcounty}<button onClick={() => setSelectedSubcounty(null)} className="hover:text-white ml-1"><X size={12} /></button></span>}
          {selectedWard && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-900/30 text-purple-400 text-xs border border-purple-800">{selectedWard}<button onClick={() => setSelectedWard(null)} className="hover:text-white ml-1"><X size={12} /></button></span>}
          {propertyType !== "All Types" && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-900/30 text-orange-400 text-xs border border-orange-800">{propertyType}<button onClick={() => setPropertyType("All Types")} className="hover:text-white ml-1"><X size={12} /></button></span>}
          {minPrice && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-900/30 text-yellow-400 text-xs border border-yellow-800">Min KSh {minPrice}<button onClick={() => setMinPrice("")} className="hover:text-white ml-1"><X size={12} /></button></span>}
          {maxPrice && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-900/30 text-yellow-400 text-xs border border-yellow-800">Max KSh {maxPrice}<button onClick={() => setMaxPrice("")} className="hover:text-white ml-1"><X size={12} /></button></span>}
        </div>
      )}
    </div>
  );
}
