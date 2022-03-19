        let map = [];
        let score = 0;
        let person = [0, 0];
        
        const BONUS_SCORE = 10
        const BONUS_COUNT = 10
        const BOMB_COUNT = 4
        const TIMER_TIME = 10
        const TIMER_COUNT = 3
        const MAP_SIZE = {width: 10, height: 10}

        const IMAGE_RESOURCES = {}

        const IMAGES = [
            { name: 'robot', url:'image\robot.svg'},
            { name: 'prize', url:'image\prize.svg'},
            { name: 'timer', url:'image\timer.svg'},
            { name: 'bomb', url:'.image\bomb.svg'},
        ]
        
        
        const initMap = (size, BONUScount, BONUSscore, BOMBcount, TIMERcount, TIMERtime) => {
            const map = []
            const bonusRecord = initBonus(size, BONUScount);
            const bombRecord = initItem(size, BOMBcount);
            const timerRecord = initItem(size, TIMERcount);

            for (let row = 0; row < size.width;row++){
                const rowItem = [];

                for (let col = 0; col < size.width; col++){
                    if(isInRecord([row, col], bonusRecord)){
                        rowItem.push(null)
                        continue;
                    }
                    else if(isInRecord([row, col], bombRecord)){
                        rowItem.push({
                            bombs: -1000
                        })
                    }
                    else if(isInRecord([row, col], timerRecord)){
                        rowItem.push({
                            timer: TIMERtime
                        })
                    }
                    else{
                        rowItem.push(null)
                    }
                }
                map.push(rowItem)
            }

            return map
        }
        
        const initBonus = (size, count) => {
            const record = [];

            while (record.length < count){
                const row = Math.floor(Math.random() * size.width);
                const col = Math.floor(Math.random() * size.height);

                //起点不能放奖励
                //这个坐标已经被使用过了
                if ((row === 0 && col === 0) || isInRecord([row, col], record)){
                    continue;
                } 

                record.push([row,col])
            }

            return record
        }
        
        const drawMap =(map) => {
            const mapContainer = document.genElementsByClassName('map')[0];

            mapContainer.innerHTML = ''

            for(let [rowIndex, row] of map.entries()) {
                const rowEl = document.createElement('div')

                rowEl.className = 'row'

                for(let[colIndex, col] of row.entries()){
                    const colEl = document.createElement('div');

                    colEl.className = 'cell'

                    const isBonusCell = isBonus(col)
                    const isBombCell = isBomb(col)
                    const isTimerCell = isTimer(col)
                    const isPersonCell = isEqualVector(person, [rowIndex, colIndex])

                    drawCellWithImage(colEl, {map, rowIndex, colIndex, col}, {isBonusCell, isBombCell, isTimerCell, isPersonCell})

                    rowEl.appendChild(colEl)
                }

                mapContainer.appendChild(rowEl)
            }
        }

        const drawCellWithImage = (container, {map, rowIndex, colIndex, col},{isBonusCell, isBombCell, isTimerCell, isPersonCell}) => {
            if(isPersonCell){
                const person =createImageContainer();

                person.appendChild(createImage(IMAGE_RESOURCES.robot))

                container.appendChild(person)
            }

            //绘制奖励
            if (isBonusCell){
                if(isPersonCell){
                    score += col.bonus;
                    map[rowIndex][colIndex] = null;
                }else{
                    const bonus = createImageContainer();
                    bonus.appendChild(createImage(IMAGE_RESOURCES.prize))
                    container.appendChild(bonus)
                }
            }
            if (isBombCell){
                if(isPersonCell){                        
                    map[rowIndex][colIndex] = null;
                    alert('踩到炸弹,游戏结束!')
                    window.location.reload()
                    return;
                 }else{
                    const bomb = createImageContainer();
                    bomb.appendChild(createImage(IMAGE_RESOURCES.bomb))
                    container.appendChild(bomb)
                }
            }
            if (isTimerCell){
                if(isPersonCell){
                    curTime += col.timer;                        
                    map[rowIndex][colIndex] = null;
                }else{
                    const timer = createImageContainer();
                    timer.appendChild(createImage(IMAGE_RESOURCES.timer))
                    container.appendChild(timer)
                }
            }
        }

        const move = (timer) => (e) => {
            const [y, x] = person
            if (y == 0 && e.code == 'ArrowUp' || y == 9 && e.code == 'ArrowDown' || x == 0 && e.code == 'ArrowLeft' || x ==9 && e.code == 'ArrowRight') {
              return;
            }
            else switch(e.code) {
              case 'ArrowRight':
                person = [y, x + 1]
                break;
              case 'ArrowUp':
                person = [y - 1, x]
                break;
              case 'ArrowDown':
                person = [y + 1, x]
                break;
              case 'ArrowLeft':
                person = [y, x - 1]
                break;
              default:
                return;
            }
            drawMap(map)
            const scoreEl = document.getElementsByClassName('score')[0];
            scoreEl.innerHTML = `你的分数: ${Math.round(score)}`
            setTimeout(() => {
              if (isBonusEmpty(map)) {
                alert('wow,游戏完成')
                clearInterval(timer);
                window.location.reload()
              }
            }, 0)
        }

        const startGame = (time = 60) => {
            hideButton()
            const timerEl = document.getElementsByClassName('timer')[0];
            window.curTime = time;
            timerEl.innerHTML = `剩余时间: ${curTime}s`
            const scoreEl = document.getElementsByClassName('score')[0];
            scoreEl.innerHTML = `你的分数: ${score}`
            const timer = setInterval(() => {
              if (curTime <= 0) {
                alert('时间到了！游戏结束。')
                clearInterval(timer)
                window.location.reload()
                return;
              }
              curTime--;
              timerEl.innerHTML = `剩余时间: ${curTime}s`
            }, 1000)
            document.addEventListener('keydown', move(timer))
        }

        const isEqualVector = (a, b) => a[0] === b[0] && a[1] === b[1]
        const isInRecord = (pos, record) => record.some(x => isEqualVector(x, pos))
        const isBonus = (item) => item && typeof item.bonus === 'number'
        const isBomb = (item) => item && typeof item.bomb === 'number'
        const isTimer = (item) => item && typeof item.timer === 'number'
        const isPerson = (item) => item && item.person

        const isBonusEmpty = (map) => map.every(row => row.every(col => !isBonus(col)))

        const createImage = (url) => {
            const image = new Image();

            image.src = url;

            return image
        }

        const createImageContainer = () => {
            const container = document.createElement('div');

            container.className = 'image-container'

            return container
        }

        const loadImage = ({name, url}) => {
            return new Promise((resolve, reject) =>{
                const image = new Image();
                image.src = url;

                image.onload = () => resolve({name, url});
                image.onerror = () => reject(url)
            })
        }

        const loadImages = async() => {
            const images = await Promise.all(IMAGES.map(loadImage))

            for(let {name, url} of images){
                IMAGE_RESOURCES[name] = url
            }
        }

        const main = async () => {
            map = initMap(MAP_SIZE, BONUS_COUNT, BONUS_SCORE, BOMB_COUNT, TIMER_COUNT, TIMER_TIME)
            console.log(map)
            await loadImages()
            drawMap(map)
        }
        
        function hideButton(){
            document.getElementById("startGame").style.visibility = 'hidden';
        }

        main()
