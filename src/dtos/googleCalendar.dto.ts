export interface ListEventsRequest {
	startDate?: string;
	endDate?: string;
}

export interface ListEventsResponse {
	events: Array<{
		start: string;
		end: string;
		summary: string;
	}>;
}
