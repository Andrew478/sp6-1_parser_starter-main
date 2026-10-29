// @todo: напишите здесь код парсера

function parsePage() {

    // meta
    let meta_lang = document.documentElement.getAttribute('lang');
    let meta_title = document.querySelector('title').textContent.split('—')[0].trim();

    let meta_description;
    let meta_keywords;
    let meta_og_tags = {};
    
    let meta_tags = document.querySelectorAll('meta');
    meta_tags.forEach(tag => {
        if(tag.getAttribute('name') === "description") meta_description = tag.getAttribute('content').trim();
        else if(tag.getAttribute('name') === "keywords") meta_keywords = tag.getAttribute('content').split(',').map(word => word.trim());
        else if(tag.hasAttribute('property') && tag.getAttribute('property').split(':')[0] === "og") {
            let tag_rightPart = tag.getAttribute('property').split(':')[1];
            if(tag.getAttribute('property').split(':')[1] === 'title') meta_og_tags[tag_rightPart] = tag.getAttribute('content').trim().split('—')[0].trim();
            else meta_og_tags[tag_rightPart] = tag.getAttribute('content').trim();
            // выше были особые условия для og:title потому что снова только ему надо отбросить текст после тире.
        }
    });


    // product
    let prod_section = document.querySelector('.product');
    let prod_id = prod_section.dataset.id;

    let prod_imgArr = prod_section.querySelectorAll('nav button img');
    prod_imgArr = Array.from(prod_imgArr);
    let prod_images = prod_imgArr.map(item => {
    return {
            preview: item.src,
            full: item.dataset['src'],
            alt: item.alt
        }
    });
    // сортируем чтобы первым слайдом точно был первый по смыслу (тег alt)
    // prod_images.sort((a,b) => {
    //     if(a.alt > b.alt) return 1;
    //     else if(a.alt < b.alt) return -1;
    //     else return 0;
    // });

    let prod_like = prod_section.querySelector('.like');
    let prod_is_liked = prod_like.classList.contains('active');

    let prod_name = prod_section.querySelector('.title').textContent.trim();

    let prod_tags = {
        category: [],
        discount: [],
        label: []
    }
    let prod_tagsArr = Array.from(prod_section.querySelector('.tags').children);
    prod_tagsArr.forEach(tag => {
        let color = tag.className;
        let textContent = tag.textContent.trim().toLowerCase();
        if(color === 'green') prod_tags.category.push(textContent);
        else if(color === 'blue') prod_tags.label.push(textContent);
        else if(color === 'red') prod_tags.discount.push(textContent);
    });


    // ТЕСТ
    let prod_pr = prod_section.querySelector('.price').textContent;
    console.log(`price class textContent: ${prod_pr}`);
    prod_pr = prod_pr.trim();
    console.log(`prod_pr after trim(): ${prod_pr}`);
    console.log(prod_pr);
    prod_pr = prod_pr.split('₽');
    console.log(`prod_prod стал массивом после split. Длина: ${prod_pr.length}, массив: ${prod_pr}`);
    console.table(prod_pr);
    // КОНЕЦ
    prod_price = prod_section.querySelector('.price').textContent.trim().split('₽');
    prod_price = prod_price.reduce((arr_prices, value) => {
        if(!value) return arr_prices; // убираем пустые слоты из массива.
        else {
            value = value.trim();
            let num = Number.parseInt(value);
            if(Number.isNaN(num)) return arr_prices;
            else  { 
                arr_prices.push(num);
                return arr_prices;
            }
        }
    }, []);

    let prod_price_new = prod_price[0];
    let prod_price_old = prod_price[1];
    let prod_discount = prod_price_old - prod_price_new;
    let prod_discount_percent = ((prod_price_old - prod_price_new) / prod_price_old) * 100;
    let prod_discount_percent_formatted = prod_discount_percent.toFixed(2) + '%';

    let currency = prod_section.querySelector('.price').textContent.trim();
    currency = Array.from(currency)[0];
    let currency_formatted = getCurrency(currency);

    function getCurrency(currency) {
        switch(currency) {
        case '$':
            return 'USD';
        case '€':
            return 'EUR';
        case '₽':
            return 'RUB';
        default:
            return 'Error';
        }
    }

    let prod_properties = prod_section.querySelectorAll('.properties li');
    prod_properties = Array.from(prod_properties);
    let prod_properties_obj = {};
    prod_properties = prod_properties.forEach(node => {
        let all_text = node.querySelectorAll('span');
        let text_key = all_text[0].textContent.trim();
        let text_value = all_text[1].textContent.trim();
        prod_properties_obj[text_key] = text_value;
    });

    let prod_description = prod_section.querySelector('.description');
    prod_description.innerHTML = prod_description.innerHTML.trim();

    function clearAllAttributes(el) {
        while(el.attributes.length > 0) el.removeAttribute(el.attributes[0].name);
    }
    function clearAllAttributesInAllElements(htmlString) {
        let copy = document.createElement('template');
        copy.innerHTML = htmlString;
        copy.content.querySelectorAll('*').forEach(el => clearAllAttributes(el));
        return copy.innerHTML;
    }
    prod_description.innerHTML = clearAllAttributesInAllElements(prod_description.innerHTML);


    // suggested
    let sug_cards = document.querySelectorAll('.suggested .items article');
    sug_cards = Array.from(sug_cards);
    let sug_cards_formatted = sug_cards.map(article => {
        let name = article.querySelector('h3').textContent.trim();
        let description = article.querySelector('p').textContent.trim();
        let image = article.querySelector('img').src.trim();
        let price = article.querySelector('b').textContent.slice(1);
        let currency = getCurrency(article.querySelector('b').textContent.slice(0,1));
        return {
            name,
            description,
            image,
            price,
            currency
        };
    });

    // reviews
    let reviews_cards = document.querySelectorAll('.reviews .items article');
    reviews_cards = Array.from(reviews_cards);
    let reviews_cards_formatted = reviews_cards.map(article => {
        let title = article.querySelector('.title').textContent.trim();
        let description = article.querySelector('p').textContent.trim();
        let date = article.querySelector('i').textContent.trim().replaceAll("/", ".");
        let author = {};
        author['name'] = article.querySelector('.author span').textContent.trim();
        author['avatar'] = article.querySelector('.author img').src.trim();
        let rating = 0;
        let ratingArr = article.querySelectorAll('.rating span').forEach(star => { if(star.classList.contains('filled')) rating++; });
        return {
            title,
            description,
            date,
            author,
            rating
        };
    });

    return {
        meta: {
            language: meta_lang,
            title: meta_title,
            description: meta_description,
            keywords: meta_keywords,
            opengraph: meta_og_tags
        },
        product: {
            name: prod_name,
            id: prod_id,
            currency: currency_formatted,
            description: prod_description.innerHTML,
            discount: prod_discount,
            discountPercent: prod_discount_percent_formatted,
            images: prod_images, // массив объектов
            isLiked: prod_is_liked,
            price: prod_price_new,
            oldPrice: prod_price_old,
            properties: prod_properties_obj,
            tags: prod_tags
        },
        suggested: sug_cards_formatted, // массив объектов
        reviews: reviews_cards_formatted // массив объектов
    };
}

window.parsePage = parsePage;