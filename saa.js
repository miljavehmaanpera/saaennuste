Vue.component('saa-item', {
    props: ['saa'],
    template: `<div valign='top'  >
                  <p align='center'> {{ saa.kellonaika }} </p>
                  <img :src="saa.kuvanosoite" align='center'></img> 
  
                  <p v-if="saa.lampotila < '0'" class="miinusAsteita" align='center'> {{ saa.lampotila }} </p>
                  <p v-if="saa.lampotila > '0'" class="plusAsteita" align='center'> +{{ saa.lampotila }} </p>
  
                  <p v-if="saa.tuuli > '6'" align='center'> {{ saa.tuuli }} 
                    <img src="https://www.freeiconspng.com/uploads/alert-icon-red-11.png" width=20px align='top'></img>
                  </p>
                  <p v-else align='center'> {{ saa.tuuli }}
                  </p>
              </div>`,
  })
  //tuulen raja laitettu oman mieltymyksen mukaan, ei perustu oikeisiin määräyksiin
  
  
  
  Vue.component('saaennuste', {
    template: `<h1>Sääennuste</h1>`
  })
  
  var app = new Vue({
    el: '#app',
    data: {
      paikkakunta: '',
      saa:[{
        paiva:'',
        kellonaika:'',
        saakuvaus:'',
        tuuli:'',
        lampotila:'',
        ikoni:'',
        kuvanosoite:'',
        id: '',
      }],
      tamaPaiva:'',
      paivamaarat:[{
        paivamaara:'',
        viikonpaiva:'',
      }],
      valittuPaiva: '',
      virheilmoitus:'',
    },
  
    methods: {
      getAnswer: function () {
        axios.get('http://api.openweathermap.org/data/2.5/forecast?q='+app.paikkakunta+'&units=metric&appid=0be24cf7cc7a6b445eec1b2c59fc83cf')
          .then(function (response) {
            
            for (index = 0; index < response.data.list.length; ++index) {
              //käytetään apu-muuttujia päivämäärän ja kellonajan pilkkomiseen yksinkertaisempaan muotoon
              // saatu ajankohta sisältää päivämäärän ja kellonajan, splitataan ensin välilyönnin kohdalta, ensimmäinen osa
              // on päivämäärä ja toinen osa kellonaika. Tämän jälkeen päivä splitataan väliviivasta, 
              // josta saadaan eroteltua päivä, kuukausi ja vuosi
              paivamaara_apu = response.data.list[index].dt_txt.split(' ')[0]; 
              vuosi_apu = paivamaara_apu.split('-')[0];
              kuukausi_apu = paivamaara_apu.split('-')[1];
              paiva_apu = paivamaara_apu.split('-')[2];
              paivamaara = paiva_apu + '.'+ kuukausi_apu + '.'+ vuosi_apu;
  
              //kellonaika splitataan kaksoispisteestä, ja jätetään sekunnit pois näytettävästä osasta
              kellonaika_apu = response.data.list[index].dt_txt.split(' ')[1];
              tunnit = kellonaika_apu.split(':')[0];
              minuutit = kellonaika_apu.split(':')[1];
              kellonaika = tunnit + '.' + minuutit;
  
              // lisätään säätieto muokatun päivämäärän ja kellonajan kanssa sää-listalle
                
              app.saa.push({
              paiva: paivamaara,
              kellonaika: 'klo ' + kellonaika,
              saakuvaus: response.data.list[index].weather[0].description,
              tuuli: response.data.list[index].wind.speed + ' m/s',
              lampotila: (response.data.list[index].main.temp).toFixed(1) + ' °C',
              kuvanosoite: "http://openweathermap.org/img/wn/"+response.data.list[index].weather[0].icon+"@2x.png",
              });
            }
          })
          .catch(function () {
            app.virheilmoitus = 'Paikkakuntaa ei löydy!' 
          })
      },
  
      haePaivamaarat: function(){
        // tyhjennetään ensin vanhat tiedot listoilta / muuttujista
          app.paivamaarat=[];
          app.saa = [];
          app.virheilmoitus = '';
          // haetaan tämä päivä ja viisi seuraavaa päivää
          for (index = 0; index < 6; ++index) { 
              var someDate = new Date(); //haetaan tämä päivä
              someDate.setDate(someDate.getDate() + index); // lisätään tähän päivään kierrosluvun mukainen määrä päiviä
              var paiva = someDate.getDate(); // irrotetaan saadusta päivämäärästä päivä
              var kk = someDate.getMonth() + 1; // irrotetaan saadusta päivämäärästä kuukausi
              var vuosi = someDate.getFullYear(); // irrotetaan saadusta päivämäärästä vuosi
              // muotoillaan päivämäärä uudestaan siten, että yksittäisten numeroiden eteen tulee nolla
              // eli lisätään päivän ja kuukauden numeron eteen nolla ja sen jälkeen valitaan kaksi viimeistä merkkiä
              DateString = (('0'+paiva).slice(-2) +'.'+ ('0'+kk).slice(-2) +'.'+ vuosi);
              // haetaan päivämäärää vastaava viikonpäivä
              var weekdays = ['su','ma','ti','ke','to','pe','la'];
              var weekday  = weekdays[someDate.getDay()];
              //lisätään kierroksen päätteeksi päivämäärä+viikonpäivä listalle  
              //app.paivamaarat.push(DateString);            
              app.paivamaarat.push({paivamaara: DateString, viikonpaiva: weekday}); 
          }
  
          //tämä päivä on päivämäärälistan ensimmäisenä alkiona
          app.tamaPaiva = app.paivamaarat[0].paivamaara;
  
          // jos päivää ei ole vielä valittu/asetettu, laitetaan oletukseksi tämä päivä
          if(app.valittuPaiva==''){
            app.valittuPaiva=app.tamaPaiva;
          }
  
          // kutsutaan funktiota, joka hakee säätiedot
          this.getAnswer();
      },
      asetaPaiva: function(){
        app.valittuPaiva = event.target.id;
      },
      asetaPaikkakunta: function(kunta){
        app.paikkakunta = kunta;
        this.haePaivamaarat();
      },  
    },
  })