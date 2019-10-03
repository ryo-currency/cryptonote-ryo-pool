/* Insert your pool's unique Javascript here */

toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-bottom-center",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}
function showToast(message="", title="") {
    toastr.success(message, title);
}

var _totalBlocks = false;
function checkForNewBlocks() {
    if(!_totalBlocks) {
	_totalBlocks = lastStats.pool.totalBlocks;
	return;
    }

    var _lastBlock = false;

    if(lastStats.pool.totalBlocks != _totalBlocks) {
	_totalBlocks = lastStats.pool.totalBlocks;
	var _lastBlockTimestamp = ":"+lastStats.pool.lastBlockFound.toString().slice(0, -3)+":";
	for(var i = 0; i < lastStats.pool.blocks.length; i += 2) {
	    if(lastStats.pool.blocks[i].indexOf(_lastBlockTimestamp) !== -1) {
		var parts = lastStats.pool.blocks[i].split(':');
		_lastBlock = {
		    height: parseInt(lastStats.pool.blocks[i+1]),
		    hash: parts[0],
		    time: parts[1],
		    difficulty: parseInt(parts[2]),
		    shares: parseInt(parts[3]),
		    orphaned: parts[4],
		    reward: parts[5]
		};
		break;
	    }
	}
    }

    if(_lastBlock !== false) {
	var _effort = (100*_lastBlock.shares/_lastBlock.difficulty).toFixed(1)
	showToast("Block at height "+_lastBlock.height+" found with "+_effort+"% effort", "Block Found!");
    }
}
