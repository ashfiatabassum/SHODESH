// Shared location data for cascading dropdowns

const locationData = {
    "Dhaka": {
        "Dhaka": ["Adabor", "Banani", "Dakshin Khan", "Dhanmondi", "Gulshan", "Jatrabari", "Kafrul", "Kamalapur", "Kawran Bazar", "Khilgaon", "Kotwali", "Krishnanagar", "Mirpur", "Mohakali", "Motijheel", "Mugda", "Paltan", "Pallabi", "Ramna", "Rampura", "Sadarbazar", "Sangu", "Shabag", "Shahbag", "Shantinagar", "Siddeshwari", "Sutrapur", "Tejgaon", "Uttara"],
        "Faridpur": ["Alfadanga", "Bhanga", "Boalmari", "Charabhagi", "Faridpur Sadar", "Madaripur", "Nagarkanda", "Sadarpur"],
        "Gazipur": ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"],
        "Manikganj": ["Ghatail", "Haripur", "Manikganj Sadar", "Saturia", "Shibalaya", "Tangail City"],
        "Munshiganj": ["Lohajang", "Munshiganj Sadar", "Sirajdikhan", "Sripur", "Tongibari"],
        "Narayanganj": ["Araihazar", "Bandar", "Narayanganj Sadar", "Rupganj", "Sonargaon"],
        "Narsingdi": ["Belabo", "Monohardi", "Narsingdi Sadar", "Palash", "Raipura", "Shibpur"],
        "Tangail": ["Basail", "Delduar", "Ghatail", "Gopalpur", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur", "Tangail Sadar", "Tutinj", "Varua"]
    },
    "Chattogram": {
        "Chattogram": ["Akber Shah", "Andermani", "Anwara", "Baizid", "Banasree", "Bayazid", "Begunbari", "Bayazid", "Chawkbazar", "Chandgaon", "Halishahar", "Hathazari", "Kamrangirchar", "Kotwali", "Labanchra", "Lohagara", "Mirsharai", "Nasirabad", "Pahartali", "Patanga", "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda"],
        "Bandarban": ["Lama", "Naikhongchari", "Rakhine", "Rangunia", "Rowangchhari", "Thanchi"],
        "Cox's Bazar": ["Chakaria", "Chhimichhari", "Cox's Bazar Sadar", "Kutubdia", "Maheshkhali", "Matarbari", "Ramu", "Teknaf", "Ukhia"],
        "Feni": ["Chhagalnaiya", "Daganbhuiyan", "Feni Sadar", "Fulgazi", "Parshuram", "Sonagazi"],
        "Khagrachari": ["Dighinala", "Khagrachari Sadar", "Laksmipur", "Mahalchhari", "Manikchhari", "Panchhari", "Ramgarh"],
        "Lakshmipur": ["Kamalnagar", "Lakshmipur Sadar", "Raipur", "Ramgati", "Ramganj"],
        "Noakhali": ["Begumganj", "Chatkhil", "Companiganj", "Jhalokati", "Jhapatali", "Noakhali Sadar", "Senbag", "Subarnachar"]
    },
    "Barishal": {
        "Barishal": ["Barisal Sadar", "Gournadi", "Hizla", "Muladi", "Mehalchandra", "Bakerganj", "Banari"],
        "Bhola": ["Bhola Sadar", "Burhanuddin", "Charfesson", "Daulkando", "Tazumuddin"],
        "Jhalokati": ["Jhalokati Sadar", "Kathalia", "Rajaiganj"],
        "Pirojpur": ["Bhandaria", "Kawkhali", "Mathbaria", "Nesarabad", "Pirojpur Sadar", "Zianagar"]
    },
    "Khulna": {
        "Khulna": ["Batiaghata", "Dacope", "Dumuria", "Khulna Sadar", "Koyra", "Terkhada"],
        "Bagerhat": ["Bagerhat Sadar", "Chitalia", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Sarankhola"],
        "Chuadanga": ["Chuadanga Sadar", "Damurhuda", "Jibannagar"],
        "Jessore": ["Abhaynagar", "Barisal", "Jessore Sadar", "Jhikargacha", "Keshabpur", "Manirampur", "Sharsha"],
        "Jhenaidah": ["Jhenaidah Sadar", "Kaliganj", "Kotchandpur", "Manirampur", "Shailkupa", "Singra"]
    },
    "Rajshahi": {
        "Rajshahi": ["Bogra", "Boalia", "Durgapur", "Godagari", "Kahalu", "Mohanpur", "Paba", "Rajshahi Sadar", "Tanore"],
        "Bogra": ["Adamdighi", "Bogra Sadar", "Dhunat", "Dupchanchia", "Gabtali", "Kahaloo", "Nandigram", "Shajahanpur", "Sherpur", "Shibganj", "Sonatola"],
        "Joypurhat": ["Akkelpur", "Joypurhat Sadar", "Kalihati", "Khetlal", "Panchbibi"],
        "Naogaon": ["Atrai", "Badalgachh", "Dhamrai", "Manda", "Naogaon Sadar", "Patnitala", "Raninagar", "Sapahar"],
        "Natore": ["Bagatipara", "Gurudaspur", "Lalpur", "Natore Sadar", "Singra"],
        "Nawabganj": ["Atwari", "Nawabganj Sadar", "Sharsha", "Sonimari"],
        "Pabna": ["Pabna Sadar", "Satkhira", "Sujanagar"]
    },
    "Rangpur": {
        "Dinajpur": ["Biral", "Birganj", "Hakimpur", "Kaharole", "Khansama", "Dinajpur Sadar", "Parbatipur"],
        "Gaibandha": ["Fulchhari", "Gaibandha Sadar", "Palashbari", "Sadullahpur", "Saghata", "Sughatta"],
        "Kurigram": ["Bhurungamari", "Charltonpur", "Kurigram Sadar", "Nageshwari", "Raiganj", "Rowmari", "Ulipur"],
        "Lalmonirhat": ["Aditmari", "Hatibandha", "Jaintiapur", "Lalmonirhat Sadar", "Patgram"],
        "Nilphamari": ["Domar", "Joypur", "Kishoreganj", "Nilphamari Sadar", "Saidpur"],
        "Pandchagarh": ["Debiganj", "Panchagarh Sadar", "Tetulia"],
        "Rangpur": ["Badarganj", "Gangachara", "Kaunia", "Mithapukur", "Pirganj", "Pirgacha", "Rangpur Sadar", "Taraganj"],
        "Thakurgaon": ["Pirganj", "Thakurgaon Sadar", "Ullapara"]
    },
    "Mymensingh": {
        "Mymensingh": ["Ananda Bazar", "Bhaluka", "Durnsingh", "Fulbaria", "Gauripur", "Jamalpur", "Mymensingh Sadar", "Nandail", "Fulpur"],
        "Jamalpur": ["Bakhargunj", "Islampur", "Jamalpur Sadar", "Madarganj", "Melandaha", "Sarisab"],
        "Kishoreganj": ["Astagram", "Bhairab", "Hosainpur", "Kishoreganj Sadar", "Kotiadi", "Kuliarchar", "Mithamain", "Pakundia"],
        "Netrokona": ["Atpara", "Barhatta", "Durgapur", "Khaliajuri", "Netrokona Sadar", "Purbadhala"]
    },
    "Sylhet": {
        "Sylhet": ["Balaganj", "Bishwanath", "Companiganj", "Fenchuganj", "Golapganj", "Jaintiapur", "Sylhet Sadar", "Sunamganj"],
        "Habiganj": ["Ajmiriganj", "Bahubal", "Chunarughat", "Habiganj Sadar", "Lakhai", "Madhabpur", "Nabiganj"],
        "Moulvibazar": ["Barlekha", "Kulaura", "Moulvibazar Sadar", "Rajnagar", "Sreemangal"],
        "Sunamganj": ["Bishwamvarpur", "Chhatak", "Dharampasha", "Dowarabazar", "Jagannathpur", "Sunamganj Sadar", "Tahirpur"]
    }
};

const divisiontoDistricts = {
    "Dhaka": ["Dhaka", "Faridpur", "Gazipur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Tangail"],
    "Chattogram": ["Chattogram", "Bandarban", "Cox's Bazar", "Feni", "Khagrachari", "Lakshmipur", "Noakhali"],
    "Barishal": ["Barishal", "Bhola", "Jhalokati", "Pirojpur"],
    "Khulna": ["Khulna", "Bagerhat", "Chuadanga", "Jessore", "Jhenaidah"],
    "Rajshahi": ["Rajshahi", "Bogra", "Joypurhat", "Naogaon", "Natore", "Nawabganj", "Pabna"],
    "Rangpur": ["Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Pandchagarh", "Rangpur", "Thakurgaon"],
    "Mymensingh": ["Mymensingh", "Jamalpur", "Kishoreganj", "Netrokona"],
    "Sylhet": ["Sylhet", "Habiganj", "Moulvibazar", "Sunamganj"]
};

function setupCascadingDropdowns(divisionSelector, districtSelector, areaSelector) {
    const divisionSelect = document.querySelector(divisionSelector);
    const districtSelect = document.querySelector(districtSelector);
    const areaSelect = document.querySelector(areaSelector);
    
    if (divisionSelect) {
        divisionSelect.addEventListener('change', function() {
            const selectedDivision = this.value;
            districtSelect.innerHTML = '<option value="" disabled selected>Select District</option>';
            districtSelect.disabled = true;
            areaSelect.innerHTML = '<option value="" disabled selected>Select Area</option>';
            areaSelect.disabled = true;
            
            if (selectedDivision && divisiontoDistricts[selectedDivision]) {
                const districts = divisiontoDistricts[selectedDivision];
                districts.forEach(district => {
                    const option = document.createElement('option');
                    option.value = district;
                    option.textContent = district;
                    districtSelect.appendChild(option);
                });
                districtSelect.disabled = false;
            }
        });
    }
    
    if (districtSelect) {
        districtSelect.addEventListener('change', function() {
            const selectedDivision = divisionSelect.value;
            const selectedDistrict = this.value;
            areaSelect.innerHTML = '<option value="" disabled selected>Select Area</option>';
            areaSelect.disabled = true;
            
            if (selectedDivision && selectedDistrict && locationData[selectedDivision] && locationData[selectedDivision][selectedDistrict]) {
                const areas = locationData[selectedDivision][selectedDistrict];
                areas.forEach(area => {
                    const option = document.createElement('option');
                    option.value = area;
                    option.textContent = area;
                    areaSelect.appendChild(option);
                });
                areaSelect.disabled = false;
            }
        });
    }
}
