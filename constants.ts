import { CatalogCategory, ProductItem, ProductImage } from './types';

const getCurrentISODate = () => new Date().toISOString();

// Helper function to parse date and time strings to ISO format
const parseDateTimeToISO = (dateString: string, timeString: string): string => {
  const dateParts = dateString.split('/');
  const timeParts = timeString.replace('a las ', '').split(':');

  // Aseguramos que el año tenga 4 dígitos
  let year = parseInt(dateParts[2]);
  if (year < 2000) year += 2000; // Asumimos siglo XXI

  const day = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1; // Meses en JS son 0-indexados
  const hour = parseInt(timeParts[0]);
  const minute = parseInt(timeParts[1]);

  return new Date(year, month, day, hour, minute).toISOString();
};

const parsePriceToNumber = (priceString: string): number => {
    return parseFloat(priceString.replace('$', '').replace(',', ''));
}

const extractFootwearSizeFromName = (name: string): string[] => {
  const sizeMatch = name.match(/(\d+(\.\d+)?\s*MX)/i);
  if (sizeMatch && sizeMatch[0]) {
    return [sizeMatch[0].toUpperCase()];
  }
  // Fallback for names like "Under Armour Charged Surge 24 MX" where size is part of name but not caught by regex for " XM"
  const generalSizeMatch = name.match(/(\d+(\.\d+)?)\s*(MX|XM)?$/i);
    if (generalSizeMatch && generalSizeMatch[1]) {
        // Attempt to check if the preceding word is a common footwear size unit.
        // This is a heuristic and might need refinement.
        const words = name.toUpperCase().split(' ');
        const sizeIndex = words.findIndex(word => word.includes(generalSizeMatch![1]));
        if (sizeIndex > 0) {
           return [`${generalSizeMatch[1]} MX`];
        }
    }
  return [];
}

const extractClothingSizeFromName = (name: string): string[] => {
  const clothingSizeMap: { [key: string]: string } = {
    "TALLA ECH": "XCH",
    "TALLA CH": "CH",
    "TALLA M": "M",
    "TALLA G": "G",
    "TALLA XG": "XG", 
  };
  for (const key in clothingSizeMap) {
    if (name.toUpperCase().includes(key)) {
      return [clothingSizeMap[key]];
    }
  }
  return [];
}

const extractVolumeFromName = (name: string): number | undefined => {
  const volumeMatch = name.match(/(\d+)\s*ml/i);
  if (volumeMatch && volumeMatch[1]) {
    return parseInt(volumeMatch[1], 10);
  }
  return undefined;
};


const newProductsData: { name: string; sku: string; date: string; time: string; price: string; stock: string; categoryHint?: string }[] = [
  // Perfumes
  { name: "Lonkoom 24K Pure Gold EDP 100 ml", sku: "RR0073", date: "9/6/2025", time: "18:13", price: "$600.00", stock: "0", categoryHint: "perfumes" },
  { name: "Lonkoom 24K Pure Pink EDP 100 ml", sku: "RR0074", date: "9/6/2025", time: "18:12", price: "$600.00", stock: "0", categoryHint: "perfumes" },
  { name: "Nautica Voyage EDT 100 ml", sku: "RR0059", date: "5/5/2025", time: "15:16", price: "$350.00", stock: "0", categoryHint: "perfumes" },
  { name: "Paris Hilton Ruby Rush 100 ml", sku: "RR0005", date: "5/5/2025", time: "15:16", price: "$650.00", stock: "2", categoryHint: "perfumes" },
  { name: "Ariana Grande R.E.M. EDP 100 ml", sku: "RR0079", date: "5/5/2025", time: "13:16", price: "$850.00", stock: "4", categoryHint: "perfumes" },
  { name: "Calvin Klein Obsession for Men EDT 125 ml", sku: "RR0069", date: "29/4/2025", time: "22:36", price: "$580.00", stock: "0", categoryHint: "perfumes" },
  { name: "Yves Saint Laurent Manifesto EDT 90 ml", sku: "RR0089", date: "29/4/2025", time: "22:35", price: "$2,700.00", stock: "0", categoryHint: "perfumes" },
  { name: "Billie Eilish No. 2 EDP 100 ml", sku: "RR0088", date: "29/4/2025", time: "19:57", price: "$950.00", stock: "0", categoryHint: "perfumes" },
  { name: "Guess 1981 EDT 100 ml", sku: "RR0058", date: "24/4/2025", time: "22:50", price: "$520.00", stock: "1", categoryHint: "perfumes" },
  { name: "Yves Saint Laurent EDT 200 ml", sku: "RR0071", date: "24/4/2025", time: "22:47", price: "$1,100.00", stock: "4", categoryHint: "perfumes" },
  { name: "Lacoste Essential EDT 125 ml", sku: "RR0076", date: "24/4/2025", time: "22:46", price: "$950.00", stock: "0", categoryHint: "perfumes" },
  { name: "Al Rehab French Coffee EDP 100 ml", sku: "RR0072", date: "24/4/2025", time: "22:27", price: "$950.00", stock: "2", categoryHint: "perfumes" },
  { name: "Calvin Klein Escape EDT 100 ml", sku: "RR0068", date: "24/4/2025", time: "19:37", price: "$650.00", stock: "3", categoryHint: "perfumes" },
  { name: "Perry Ellis Love EDP 100 ml", sku: "RR0078", date: "15/4/2025", time: "22:52", price: "$550.00", stock: "5", categoryHint: "perfumes" },
  { name: "Bebe by Bebe EDP 100 ml", sku: "RR0077", date: "15/4/2025", time: "22:34", price: "$650.00", stock: "3", categoryHint: "perfumes" },
  { name: "Hollister Festival Vibes EDP 100 ml", sku: "RR0075", date: "15/4/2025", time: "21:51", price: "$600.00", stock: "2", categoryHint: "perfumes" },
  { name: "Calvin Klein CK Be EDT 200 ml", sku: "RR0070", date: "14/4/2025", time: "22:55", price: "$650.00", stock: "2", categoryHint: "perfumes" },
  { name: "Guess 1981 Indigo EDT 100 ml", sku: "RR0067", date: "14/4/2025", time: "22:21", price: "$520.00", stock: "1", categoryHint: "perfumes" },
  { name: "Salvatore Ferragamo Pour Homme EDT 100 ml", sku: "RR0066", date: "14/4/2025", time: "22:08", price: "$620.00", stock: "1", categoryHint: "perfumes" },
  { name: "Elizabeth Arden Green Tea EDP 100 ml", sku: "RR0063", date: "14/4/2025", time: "21:51", price: "$500.00", stock: "1", categoryHint: "perfumes" },
  { name: "Merve Neon Moon EDP 100 ml", sku: "RR0062", date: "14/4/2025", time: "21:49", price: "$850.00", stock: "1", categoryHint: "perfumes" },
  { name: "Merve Lempereur EDP 100 ml", sku: "RR0061", date: "14/4/2025", time: "21:49", price: "$850.00", stock: "1", categoryHint: "perfumes" },
  { name: "Banana Republic M EDP 125 ml", sku: "RR0064", date: "14/4/2025", time: "20:43", price: "$850.00", stock: "4", categoryHint: "perfumes" },
  { name: "Guess Marciano EDT 100 ml", sku: "RR0065", date: "14/4/2025", time: "20:40", price: "$520.00", stock: "2", categoryHint: "perfumes" },
  { name: "Hollister Wave EDP 100 ml", sku: "RR0006", date: "12/4/2025", time: "9:36", price: "$580.00", stock: "0", categoryHint: "perfumes" },
  { name: "Ralph Lauren Big Pony EDT 100 ml", sku: "RR0060", date: "11/4/2025", time: "20:03", price: "$1,050.00", stock: "2", categoryHint: "perfumes" },
  { name: "Guess EDP 75 ml", sku: "RR0057", date: "11/4/2025", time: "19:24", price: "$500.00", stock: "2", categoryHint: "perfumes" },
  { name: "Hugo Boss Deep Red EDP 90 ml", sku: "RR0056", date: "11/4/2025", time: "18:59", price: "$680.00", stock: "1", categoryHint: "perfumes" },
  { name: "Katy Perry Spray Purr 100 ml", sku: "RR0007", date: "30/3/2025", time: "18:52", price: "$520.00", stock: "0", categoryHint: "perfumes" },
  { name: "Set Ferrioni Sunset Vibes Malibu 100 ml", sku: "RR0001", date: "30/3/2025", time: "11:39", price: "$750.00", stock: "1", categoryHint: "perfumes" },
  // Modified Grey Flannel entry
  { name: "Grey Flannel Geoffrey Beene", sku: "RR0004", date: "30/3/2025", time: "0:33", price: "$450.00", stock: "0", categoryHint: "perfumes" },
  { name: "Perry Ellis 360° White 100 ml", sku: "RR0003", date: "30/3/2025", time: "0:29", price: "$550.00", stock: "0", categoryHint: "perfumes" },
  { name: "Set Oscar De La Renta 100 ml", sku: "RR0002", date: "30/3/2025", time: "0:20", price: "$950.00", stock: "1", categoryHint: "perfumes" },

  // Calzado
  { name: "Tenis Under Armour Charged Pursuit 3 24 MX", sku: "RR0080", date: "9/6/2025", time: "18:11", price: "$1,659.00", stock: "0", categoryHint: "calzado" },
  { name: "Tenis Under Armour Charged Revitalize 23.5 MX", sku: "RR0084", date: "9/6/2025", time: "18:11", price: "$1,549.00", stock: "0", categoryHint: "calzado" },
  { name: "Under Armour Charged Surge 24 MX", sku: "RR0085", date: "9/6/2025", time: "18:10", price: "$1,499.00", stock: "0", categoryHint: "calzado" },
  { name: "Tenis Puma Suede 24.5 MX", sku: "RR0082", date: "9/6/2025", time: "18:10", price: "$1,299.00", stock: "0", categoryHint: "calzado" },
  { name: "Tenis Puma Deportivo Futbol 27.5 MX", sku: "RR0013", date: "16/5/2025", time: "8:50", price: "$1,199.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis DC Shoes Notch SN 26 MX", sku: "RR0049", date: "16/5/2025", time: "8:45", price: "$850.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Reebok Court Clean 25 MX", sku: "RR0042", date: "13/5/2025", time: "15:58", price: "$1,199.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis DC Shoes Notch 26 MX", sku: "RR0050", date: "13/5/2025", time: "15:55", price: "$899.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis DC Shoes Central 27.5 MX", sku: "RR0021", date: "13/5/2025", time: "15:53", price: "$1,049.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis DC Shoes Method 25 MX", sku: "RR0030", date: "13/5/2025", time: "15:51", price: "$849.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Under Armour Charged Verssert 22.5 MX", sku: "RR0086", date: "13/5/2025", time: "15:49", price: "$1,449.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis DC Shoes Notch TX 27 MX", sku: "RR0051", date: "13/5/2025", time: "15:47", price: "$849.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis DC Shoes Flash 26.5 MX", sku: "RR0055", date: "13/5/2025", time: "15:46", price: "$899.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis DC Shoes Method TX 27 MX", sku: "RR0052", date: "13/5/2025", time: "15:45", price: "$899.00", stock: "1", categoryHint: "calzado" },
  { name: "Zapato Original Penguin Style Mau", sku: "RR0024", date: "13/5/2025", time: "15:44", price: "$1,249.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Vans Old Skool Classic Suede 23 MX", sku: "RR0083", date: "13/5/2025", time: "15:42", price: "$1,149.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Original Penguin Style Lya 24 MX", sku: "RR0027", date: "13/5/2025", time: "15:41", price: "$1,199.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Asics Patriot 13 22.5 MX", sku: "RR0087", date: "13/5/2025", time: "15:38", price: "$1,649.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Reebok Energen Tech 2 23.5 MX", sku: "RR0090", date: "13/5/2025", time: "15:37", price: "$1,399.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Skechers Graceful Sport 23 MX", sku: "RR0015", date: "13/5/2025", time: "15:36", price: "$1,349.00", stock: "5", categoryHint: "calzado" },
  { name: "Tenis Nike Promina 23.5 MX", sku: "RR0081", date: "13/5/2025", time: "15:33", price: "$1,649.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Reebok Royal Basketball 29 MX", sku: "RR0044", date: "13/5/2025", time: "15:32", price: "$1,499.00", stock: "2", categoryHint: "calzado" },
  { name: "Tenis Aeropostale Violet 23 MX", sku: "RR0092", date: "13/5/2025", time: "15:31", price: "$849.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Skechers Summits Diamond 22.5 MX", sku: "RR0031", date: "13/5/2025", time: "15:30", price: "$1,399.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Adidas Questar 26 MX", sku: "RR0040", date: "13/5/2025", time: "15:16", price: "$1,549.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Original Penguin Style Rachel 25 MX", sku: "RR0026", date: "13/5/2025", time: "15:15", price: "$1,049.00", stock: "2", categoryHint: "calzado" },
  { name: "Tenis Under Armour Casual Essential Sportstyle 27 MX", sku: "RR0047", date: "13/5/2025", time: "15:14", price: "$1,499.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Under Armour Charged Speed 25.5 MX", sku: "RR0045", date: "13/5/2025", time: "15:14", price: "$1,499.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Puma Pacer Easy Street 20 MX", sku: "RR0038", date: "13/5/2025", time: "15:14", price: "$1,199.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Original Penguin Style Brenda 23 MX", sku: "RR0018", date: "13/5/2025", time: "15:12", price: "$1,199.00", stock: "2", categoryHint: "calzado" },
  { name: "Vans Old Skool 26 MX", sku: "RR0029", date: "13/5/2025", time: "15:11", price: "$1,349.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Vans Sk8-hi Reissue 19.5 MX", sku: "RR0020", date: "13/5/2025", time: "15:10", price: "$1,099.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Reebok Active Lite 26 MX", sku: "RR0043", date: "13/5/2025", time: "15:08", price: "$1,299.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Puma Flyer Runner 25 MX", sku: "RR0035", date: "13/5/2025", time: "15:08", price: "$1,349.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Reebok Ztaur Run 28 MX", sku: "RR0011", date: "13/5/2025", time: "15:07", price: "$1,449.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Adidas Puremotion 2.0 27 MX", sku: "RR0039", date: "13/5/2025", time: "15:07", price: "$1,649.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Original Penguin Style Helen 25 MX", sku: "RR0023", date: "13/5/2025", time: "15:06", price: "$1,199.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Reebok Jogger Lite 28 MX", sku: "RR0019", date: "13/5/2025", time: "15:05", price: "$1,299.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Puma Cell Thrill 25.5 MX", sku: "RR0016", date: "13/5/2025", time: "15:05", price: "$1,499.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Puma UP 27.5 MX", sku: "RR0009", date: "13/5/2025", time: "15:04", price: "$1,049.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Original Penguin Style Elsie 24 MX", sku: "RR0028", date: "13/5/2025", time: "15:03", price: "$959.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Original Penguin Style Janny 25 MX", sku: "RR0025", date: "13/5/2025", time: "14:58", price: "$999.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Puma Prowl Slip On Knit 25 MX", sku: "RR0037", date: "13/5/2025", time: "14:57", price: "$1,199.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Puma Retaliate 3 23.5 MX", sku: "RR0091", date: "13/5/2025", time: "14:55", price: "$1,599.00", stock: "1", categoryHint: "calzado" },
  { name: "Tenis Adidas VL Court 3.0 26 XM", sku: "RR0113", date: "12/5/2025", time: "20:00", price: "$1,200.00", stock: "0", categoryHint: "calzado" }, 
  { name: "Tenis Puma Skyrocket", sku: "RR0036", date: "5/5/2025", time: "15:13", price: "$1,350.00", stock: "0", categoryHint: "calzado" },
  { name: "Tenis Tommy Hilfiger", sku: "RR0012", date: "5/5/2025", time: "15:11", price: "$1,700.00", stock: "0", categoryHint: "calzado" },
  { name: "Tenis Puma Redeem Profoam", sku: "RR0033", date: "29/4/2025", time: "22:40", price: "$1,250.00", stock: "0", categoryHint: "calzado" },
  { name: "Tenis Original Penguin Style Lise", sku: "RR0022", date: "29/4/2025", time: "21:15", price: "$750.00", stock: "0", categoryHint: "calzado" },
  { name: "Tenis Penguin Style Penelope", sku: "RR0032", date: "24/4/2025", time: "22:24", price: "$950.00", stock: "0", categoryHint: "calzado" },
  { name: "Tenis Puma Softride Orla", sku: "RR0034", date: "24/4/2025", time: "22:21", price: "$1,300.00", stock: "0", categoryHint: "calzado" },
  { name: "Tenis DC Shoes Method SN", sku: "RR0054", date: "2/4/2025", time: "21:48", price: "$800.00", stock: "0", categoryHint: "calzado" },
  { name: "Tenis DC Shoes Method", sku: "RR0053", date: "2/4/2025", time: "21:40", price: "$1,000.00", stock: "0", categoryHint: "calzado" },
  { name: "Tenis Skechers Summits Gray", sku: "RR0017", date: "2/4/2025", time: "20:32", price: "$1,300.00", stock: "0", categoryHint: "calzado" },
  { name: "Tenis Under Armour Charged Verssert", sku: "RR0048", date: "1/4/2025", time: "23:21", price: "$1,550.00", stock: "0", categoryHint: "calzado" },
  { name: "Tenis Under Armour Phade", sku: "RR0046", date: "1/4/2025", time: "22:13", price: "$1,500.00", stock: "0", categoryHint: "calzado" },
  { name: "Tenis Reebok Court Advance", sku: "RR0041", date: "1/4/2025", time: "20:43", price: "$1,550.00", stock: "0", categoryHint: "calzado" },
  { name: "Tenis Reebok BB 1000", sku: "RR0010", date: "31/3/2025", time: "23:36", price: "$1,200.00", stock: "0", categoryHint: "calzado" },
  { name: "Tenis Reebok Royal", sku: "RR0014", date: "31/3/2025", time: "23:34", price: "$1,250.00", stock: "0", categoryHint: "calzado" },
  { name: "Tenis Puma Reflect Lite", sku: "RR0008", date: "31/3/2025", time: "19:49", price: "$1,250.00", stock: "0", categoryHint: "calzado" },

  // Ropa
  { name: "Playera Under Armour Talla M", sku: "RR0112", date: "8/5/2025", time: "23:55", price: "$499.00", stock: "1", categoryHint: "ropa" },
  { name: "Playera Adidas Talla M", sku: "RR0111", date: "8/5/2025", time: "23:49", price: "$299.00", stock: "1", categoryHint: "ropa" },
  { name: "Sudadera Under Armour Talla G", sku: "RR0094", date: "8/5/2025", time: "23:32", price: "$799.00", stock: "1", categoryHint: "ropa" },
  { name: "Conjunto Deportivo Under Armour Talla M", sku: "RR0096", date: "8/5/2025", time: "23:31", price: "$1,499.00", stock: "1", categoryHint: "ropa" },
  { name: "Playera Under Armour Talla G", sku: "RR0097", date: "8/5/2025", time: "23:30", price: "$519.00", stock: "1", categoryHint: "ropa" },
  { name: "Playera Puma Estampada Talla ECH", sku: "RR0099", date: "8/5/2025", time: "23:30", price: "$449.00", stock: "1", categoryHint: "ropa" },
  { name: "Playera Puma Hyper Tank Talla G", sku: "RR0100", date: "8/5/2025", time: "23:29", price: "$499.00", stock: "1", categoryHint: "ropa" },
  { name: "Playera Puma Ultra Talla G", sku: "RR0101", date: "8/5/2025", time: "23:29", price: "$579.00", stock: "1", categoryHint: "ropa" },
  { name: "Playera Calvin Klein Talla M", sku: "RR0102", date: "8/5/2025", time: "23:29", price: "$579.00", stock: "1", categoryHint: "ropa" },
  { name: "Playera Nautica Talla G", sku: "RR0103", date: "8/5/2025", time: "23:28", price: "$499.00", stock: "1", categoryHint: "ropa" },
  { name: "Leggings Under Armour Talla M", sku: "RR0095", date: "8/5/2025", time: "23:28", price: "$599.00", stock: "1", categoryHint: "ropa" },
  { name: "Sudadera American Eagle Snoopy Talla CH", sku: "RR0105", date: "8/5/2025", time: "23:27", price: "$1,499.00", stock: "1", categoryHint: "ropa" },
  { name: "Playera Puma Run Talla CH", sku: "RR0098", date: "8/5/2025", time: "23:26", price: "$499.00", stock: "1", categoryHint: "ropa" },
  { name: "Playera Reebok Basic Talla M", sku: "RR0110", date: "8/5/2025", time: "23:20", price: "$349.00", stock: "1", categoryHint: "ropa" },
  { name: "Playera Original Penguin Polo", sku: "RR0109", date: "8/5/2025", time: "23:06", price: "$550.00", stock: "0", categoryHint: "ropa" },
  { name: "Playera Original Penguin Letras", sku: "RR0107", date: "8/5/2025", time: "22:53", price: "$480.00", stock: "0", categoryHint: "ropa" },
  { name: "Playera Original Penguin Estampada", sku: "RR0104", date: "8/5/2025", time: "15:56", price: "$480.00", stock: "0", categoryHint: "ropa" },
  { name: "Playera Original Penguin Bordada", sku: "RR0108", date: "8/5/2025", time: "15:53", price: "$520.00", stock: "0", categoryHint: "ropa" },
  { name: "Playera Original Penguin Bloques", sku: "RR0106", date: "8/5/2025", time: "15:26", price: "$480.00", stock: "0", categoryHint: "ropa" },

  // Accesorios
  { name: "Maleta Deportiva Under Armour", sku: "RR0093", date: "8/5/2025", time: "23:31", price: "$1,099.00", stock: "1", categoryHint: "accesorios" },
];


const processedNewProducts: ProductItem[] = newProductsData.map((p, index) => {
  const numericPrice = parsePriceToNumber(p.price);
  let categoryId = p.categoryHint || 'accesorios'; 
  let categoryName = 'Accesorios';
  let productName = p.name;

  if (p.name.toLowerCase().includes('perfume') || p.name.toLowerCase().includes('edt') || p.name.toLowerCase().includes('edp') || p.categoryHint === 'perfumes') {
    categoryId = 'perfumes';
  } else if (p.name.toLowerCase().includes('tenis') || p.name.toLowerCase().includes('zapato') || p.categoryHint === 'calzado') {
    categoryId = 'calzado';
  } else if (p.name.toLowerCase().includes('playera') || p.name.toLowerCase().includes('sudadera') || p.name.toLowerCase().includes('leggings') || p.name.toLowerCase().includes('conjunto') || p.categoryHint === 'ropa') {
    categoryId = 'ropa';
  } else {
    categoryId = 'accesorios';
  }
  
  if (categoryId === 'calzado') categoryName = 'Calzado';
  if (categoryId === 'perfumes') categoryName = 'Perfumes';
  if (categoryId === 'ropa') categoryName = 'Ropa';

  const imageUrl = `https://picsum.photos/seed/${p.sku}/300/200`;
  
  let sizes: string[] = [];
  if (categoryId === 'calzado') {
    sizes = extractFootwearSizeFromName(p.name);
     if (p.sku === 'RR0113' && p.name.toUpperCase().includes('26 XM')) sizes = ['26 MX']; 
  } else if (categoryId === 'ropa') {
    sizes = extractClothingSizeFromName(p.name);
  }

  let volumeMl = categoryId === 'perfumes' ? extractVolumeFromName(p.name) : undefined;
  let availableVolumesMl: number[] | undefined = undefined;
  let volumePrices: { volume: number; price: string }[] | undefined = undefined;

  if (p.sku === 'RR0004') { // Special handling for Grey Flannel Geoffrey Beene
    productName = "Grey Flannel Geoffrey Beene"; // Remove volume from name
    volumeMl = 120;
    availableVolumesMl = [120, 240];
    volumePrices = [
      { volume: 120, price: "$450.00" },
      { volume: 240, price: "$650.00" }
    ];
  } else if (categoryId === 'perfumes' && volumeMl !== undefined && volumeMl > 0) {
    availableVolumesMl = [volumeMl];
    volumePrices = [{ volume: volumeMl, price: p.price }];
  }


  return {
    id: `new_${p.sku}_${index}`, 
    name: productName,
    description: productName, 
    imageUrl: imageUrl,
    images: [{ id: `img_main_${p.sku}`, url: imageUrl, isMain: true }],
    spinImages: [], 
    price: p.price, 
    costPrice: numericPrice / 2,
    stock: parseInt(p.stock) || 0,
    sku: p.sku,
    categoryId: categoryId,
    categoryName: categoryName,
    updatedAt: parseDateTimeToISO(p.date, p.time),
    sizes: sizes,
    sizePrices: [], // Default for sizePrices
    volumeMl: volumeMl, 
    availableVolumesMl: availableVolumesMl,
    volumePrices: volumePrices,
    // Defaults for new fields
    subcategoryId: '',
    barcodeType: '',
    eanGtin: '',
    autoSku: false,
    productCondition: 'Nuevo',
    unitType: 'Pieza', // Default unitType
    brand: '',
    // isUnbrandedOrKit: false, // Removed
    hasVariations: false,
    reservedStock: 0,
    lowStockNotificationThreshold: 5,
  };
});

// Helper to generate spin images for a product
const generateSpinImages = (productId: string, count: number): ProductImage[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `spin_${productId}_${i + 1}`,
    url: `https://picsum.photos/seed/${productId}-spin${i + 1}/600/400`,
    isMain: false,
  }));
};

const defaultNewFields: Omit<ProductItem, 'id'|'name'|'description'|'imageUrl'|'images'|'price'|'costPrice'|'stock'|'sku'|'categoryId'|'updatedAt'> = {
  subcategoryId: '',
  barcodeType: '' as const, // Cast to literal type
  eanGtin: '',
  autoSku: false,
  productCondition: 'Nuevo' as const,
  unitType: 'Pieza' as const, // Updated default
  brand: '',
  // isUnbrandedOrKit: false, // Removed
  hasVariations: false,
  reservedStock: 0,
  lowStockNotificationThreshold: 5,
  sizes: [],
  sizePrices: [], // Default for sizePrices
  volumeMl: undefined,
  availableVolumesMl: [],
  volumePrices: [],
  spinImages: [],
};


export const CATALOG_DATA: CatalogCategory[] = [
  {
    id: 'accesorios',
    name: 'Accesorios',
    description: 'Gama que te hará lucir con elegancia y estilo',
    items: [
      {
        id: 'acc1',
        name: 'Guante de Boxeo Pro',
        description: 'Guantes de boxeo profesionales para entrenamiento y competición. Fabricados con cuero de alta calidad y acolchado multicapa para máxima protección y durabilidad. Diseño ergonómico que asegura un ajuste cómodo y seguro.',
        imageUrl: 'https://picsum.photos/seed/acc1/300/200',
        images: [{ id: 'img_acc1_main', url: 'https://picsum.photos/seed/acc1/300/200', isMain: true }],
        spinImages: generateSpinImages('acc1', 5), // Example with 5 spin images
        price: '$49.99',
        costPrice: 25.00,
        stock: 150,
        sku: 'SF-ACC-BOXGLV-001',
        categoryId: 'accesorios',
        categoryName: 'Accesorios',
        updatedAt: getCurrentISODate(),
        ...defaultNewFields,
      },
      {
        id: 'acc2',
        name: 'Cuerda para Saltar Speed',
        description: 'Cuerda para saltar de alta velocidad, ideal para cardio y mejorar la agilidad. Mangos ergonómicos antideslizantes y cable de acero recubierto ajustable. Perfecta para CrossFit, boxeo y fitness general.',
        imageUrl: 'https://picsum.photos/seed/acc2/300/200',
        images: [{ id: 'img_acc2_main', url: 'https://picsum.photos/seed/acc2/300/200', isMain: true }],
        spinImages: [],
        price: '$19.99',
        costPrice: 8.50,
        stock: 300,
        sku: 'SF-ACC-JUMPRP-002',
        categoryId: 'accesorios',
        categoryName: 'Accesorios',
        updatedAt: getCurrentISODate(),
        ...defaultNewFields,
      },
      ...processedNewProducts.filter(p => p.categoryId === 'accesorios')
    ],
  },
  {
    id: 'calzado',
    name: 'Calzado',
    description: 'Descubre el máximo confort y performance en cada paso que das',
    items: [
      {
        id: 'cal1',
        name: 'Zapatillas Runner Max',
        description: 'Zapatillas de running diseñadas para corredores neutros que buscan máxima amortiguación y respuesta. Upper transpirable y suela de alta tracción para todo tipo de superficies.',
        imageUrl: 'https://picsum.photos/seed/cal1/300/200',
        images: [{ id: 'img_cal1_main', url: 'https://picsum.photos/seed/cal1/300/200', isMain: true }],
        spinImages: generateSpinImages('cal1', 8), 
        price: '$129.99',
        costPrice: 60.00,
        stock: 80,
        sku: 'SF-CAL-RUNMAX-001',
        categoryId: 'calzado',
        categoryName: 'Calzado',
        updatedAt: getCurrentISODate(),
        sizes: ["26 MX", "27 MX", "28 MX"],
        sizePrices: [{size: "28 MX", price: "$139.99"}], // Example size price
        ...defaultNewFields,
        // Ensure defaultNewFields doesn't override sizes for this item
        // Override sizes after spreading defaultNewFields if defaultNewFields.sizes is always []
      },
      {
        id: 'cal2',
        name: 'Botas de Fútbol Strike',
        description: 'Botas de fútbol para terreno firme, ofrecen un toque preciso y una tracción explosiva. Diseño ligero y ajuste ceñido para un control óptimo del balón.',
        imageUrl: 'https://picsum.photos/seed/cal2/300/200',
        images: [{ id: 'img_cal2_main', url: 'https://picsum.photos/seed/cal2/300/200', isMain: true }],
        spinImages: [],
        price: '$99.99',
        costPrice: 45.00,
        stock: 120,
        sku: 'SF-CAL-FBTSTRK-002',
        categoryId: 'calzado',
        categoryName: 'Calzado',
        updatedAt: getCurrentISODate(),
        sizes: ["25.5 MX", "26.5 MX", "27.5 MX"],
        ...defaultNewFields,
      },
      ...processedNewProducts.filter(p => p.categoryId === 'calzado')
    ],
  },
  {
    id: 'perfumes',
    name: 'Perfumes',
    description: 'Fragancias perfectas para atraer miradas y destacar tu personalidad',
    items: [
      {
        id: 'per1',
        name: 'Aqua Sport EDT 100 ml',
        description: 'Eau de Toilette refrescante con notas cítricas y acuáticas, diseñada para el hombre activo. Larga duración y aroma vigorizante.',
        imageUrl: 'https://picsum.photos/seed/per1/300/200',
        images: [{ id: 'img_per1_main', url: 'https://picsum.photos/seed/per1/300/200', isMain: true }],
        spinImages: [],
        price: '$59.99',
        costPrice: 22.00,
        stock: 200,
        sku: 'SF-PER-AQUAEDT-001',
        categoryId: 'perfumes',
        categoryName: 'Perfumes',
        updatedAt: getCurrentISODate(),
        volumeMl: 100,
        availableVolumesMl: [100],
        volumePrices: [{volume: 100, price: '$59.99'}],
        ...defaultNewFields,
      },
      {
        id: 'per2',
        name: 'Energy Boost Parfum 50 ml',
        description: 'Parfum intenso con notas amaderadas y especiadas para una explosión de energía. Ideal para después del entrenamiento o para una salida nocturna.',
        imageUrl: 'https://picsum.photos/seed/per2/300/200',
        images: [{ id: 'img_per2_main', url: 'https://picsum.photos/seed/per2/300/200', isMain: true }],
        spinImages: [],
        price: '$79.99',
        costPrice: 35.00,
        stock: 90,
        sku: 'SF-PER-ENRGBST-002',
        categoryId: 'perfumes',
        categoryName: 'Perfumes',
        updatedAt: getCurrentISODate(),
        volumeMl: 50,
        availableVolumesMl: [50],
        volumePrices: [{volume: 50, price: '$79.99'}],
        ...defaultNewFields,
      },
      ...processedNewProducts.filter(p => p.categoryId === 'perfumes')
    ],
  },
  {
    id: 'ropa',
    name: 'Ropa',
    description: 'Vístete para el éxito luciendo elegancia y personalidad',
    items: [
      {
        id: 'rop1',
        name: 'Camiseta Técnica DryFit Talla M',
        description: 'Camiseta técnica con tecnología DryFit que absorbe el sudor para mantenerte seco y cómodo. Tejido ligero y transpirable, ideal para cualquier actividad deportiva.',
        imageUrl: 'https://picsum.photos/seed/rop1/300/200',
        images: [{ id: 'img_rop1_main', url: 'https://picsum.photos/seed/rop1/300/200', isMain: true }],
        spinImages: [],
        price: '$39.99',
        costPrice: 15.00,
        stock: 250,
        sku: 'SF-ROP-DRYFIT-001',
        categoryId: 'ropa',
        categoryName: 'Ropa',
        updatedAt: getCurrentISODate(),
        sizes: ["M", "G"],
        sizePrices: [{size: "G", price: "$42.99"}], // Example size price
        ...defaultNewFields,
      },
      {
        id: 'rop2',
        name: 'Leggings Compresión Max Talla CH',
        description: 'Leggings de compresión que ofrecen soporte muscular y mejoran la circulación. Tejido elástico en cuatro direcciones para total libertad de movimiento.',
        imageUrl: 'https://picsum.photos/seed/rop2/300/200',
        images: [{ id: 'img_rop2_main', url: 'https://picsum.photos/seed/rop2/300/200', isMain: true }],
        spinImages: [],
        price: '$54.99',
        costPrice: 20.00,
        stock: 180,
        sku: 'SF-ROP-LEGMAX-002',
        categoryId: 'ropa',
        categoryName: 'Ropa',
        updatedAt: getCurrentISODate(),
        sizes: ["CH"],
        ...defaultNewFields,
      },
      ...processedNewProducts.filter(p => p.categoryId === 'ropa')
    ],
  },
];