class HashMap{
    size = 100;
    stackSize = 10;

    map;

    constructor(size = 0, stackSize = 0){
        this.size = size;
        this.stackSize = stackSize;

        var main = new Array(this.size);
        for (let i = 0; i < this.size; i++){
            main[i] = new Array(this.stackSize);
        }
        this.map = main;
    }

    load(txt){        
        var keyValue = this.key(txt);
        try {
            if (this.map[keyValue][0] == null)
                this.map[keyValue][0] = txt;
            else
                for (var i = 1; i < this.map[keyValue].length; i++)
                    if (this.map[keyValue][i] == null){
                        this.map[keyValue][i] = txt;
                        break;
                    }
        }catch(err){
            console.log('Something went wrong loading the hashmap!');
        }

    }

    textExist(txt){
        var keyValue = this.key(txt);

        try{
            for (let i = 0; i < this.map[keyValue].length; i++)
                if (this.map[keyValue][i] == txt)
                    return true;
        }catch(err){
            return false;
        }
            
        return false;
    }

    key(input = '') {
        var total = 0;
        var lowerInput = input.toLowerCase();
        
        for (var i = 0; i < input.length; i++)
            total += lowerInput.charCodeAt(i);
        
        return Math.round((total / Math.PI) / 3);
    }
}

module.exports.HashMap = HashMap;