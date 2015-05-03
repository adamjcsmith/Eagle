'use strict';


module.exports = function DashboardModel() {
    return {
        name: 'Dashboard Test',
		pages: [{name: 'Insights', link: 'insights'}, {name: 'Context', link: 'context'}],
    };
};
