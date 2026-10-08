// Illustrative planning assumptions, never observed PaintMe metrics.
const web = [
  {scenario:'conservador',users:2000,sessionsPerUser:1.5,pagesPerSession:1.6,eligibleShare:.5,pageRPM:.5,cost:5},
  {scenario:'base',users:10000,sessionsPerUser:2,pagesPerSession:2,eligibleShare:.65,pageRPM:1.5,cost:5},
  {scenario:'optimista',users:50000,sessionsPerUser:3,pagesPerSession:2.5,eligibleShare:.8,pageRPM:4,cost:5}
].map(s=>{const sessions=s.users*s.sessionsPerUser,pages=sessions*s.pagesPerSession,eligiblePages=pages*s.eligibleShare,gross=eligiblePages*s.pageRPM/1000;return {...s,sessions,pages,eligiblePages,gross,operating:gross-s.cost};});
const mobile = [
  {scenario:'conservador',mau:500,sessionsPerMau:3,opportunitiesPerSession:1,fill:.4,show:.8,bannerECPM:.2,cost:7},
  {scenario:'base',mau:5000,sessionsPerMau:6,opportunitiesPerSession:1.5,fill:.65,show:.85,bannerECPM:.6,cost:7},
  {scenario:'optimista',mau:25000,sessionsPerMau:10,opportunitiesPerSession:2,fill:.85,show:.9,bannerECPM:1.5,cost:7}
].map(s=>{const sessions=s.mau*s.sessionsPerMau,opportunities=sessions*s.opportunitiesPerSession,impressions=opportunities*s.fill*s.show,gross=impressions*s.bannerECPM/1000;return {...s,sessions,opportunities,impressions,gross,operating:gross-s.cost};});
const goals=[100,300,500,1400];
const webTargets=web.map(s=>({scenario:s.scenario,targets:goals.map(goal=>({goal,eligiblePages:Math.ceil(goal*1000/s.pageRPM),totalPages:Math.ceil(goal*1000/s.pageRPM/s.eligibleShare),users:Math.ceil(goal*1000/s.pageRPM/s.eligibleShare/s.sessionsPerUser/s.pagesPerSession),eligiblePagesForOperating:Math.ceil((goal+s.cost)*1000/s.pageRPM)}))}));
const mobileTargets=mobile.map(s=>({scenario:s.scenario,targets:goals.map(goal=>({goal,impressions:Math.ceil(goal*1000/s.bannerECPM),opportunities:Math.ceil(goal*1000/s.bannerECPM/s.fill/s.show),mau:Math.ceil(goal*1000/s.bannerECPM/s.fill/s.show/s.sessionsPerMau/s.opportunitiesPerSession),mauForOperating:Math.ceil((goal+s.cost)*1000/s.bannerECPM/s.fill/s.show/s.sessionsPerMau/s.opportunitiesPerSession)}))}));
const mix={eligibleWebPages:200*1000/1.5,pageRPM:1.5,adultQualifiedVisits:10000,conversion:.01,price:12,orders:100,paymentVariableRate:.10,refundRate:.05,fixedCost:25};
mix.ads=mix.eligibleWebPages*mix.pageRPM/1000;mix.sales=mix.orders*mix.price;mix.gross=mix.ads+mix.sales;mix.paymentCost=mix.sales*mix.paymentVariableRate;mix.refunds=mix.sales*mix.refundRate;mix.operating=mix.gross-mix.paymentCost-mix.refunds-mix.fixedCost;
console.log(JSON.stringify({note:'USD monthly; assumptions, not forecast or benchmarks; labor and taxes excluded from operating.',web,mobile,webTargets,mobileTargets,mix},null,2));
