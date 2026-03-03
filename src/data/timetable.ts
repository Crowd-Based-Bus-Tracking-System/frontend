export interface StopSchedule {
  stopId: string;
  arrivalTime: string;
}

export interface TimetableEntry {
  tripId: string;
  busId: string;
  departureTime: string;
  arrivalTime: string;
  busType: "express" | "normal" | "semi-luxury";
  stopSchedules: StopSchedule[];
}

export interface RouteTimetable {
  routeId: string;
  weekday: TimetableEntry[];
  weekend: TimetableEntry[];
}

export const timetables: Record<string, RouteTimetable> = {

  "route-1": {
    routeId: "route-1",
    weekday: [
      {
            "tripId": "trip-1",
            "busId": "b1",
            "departureTime": "05:00",
            "arrivalTime": "06:20",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s1",
                        "arrivalTime": "05:00"
                  },
                  {
                        "stopId": "s2",
                        "arrivalTime": "05:20"
                  },
                  {
                        "stopId": "s3",
                        "arrivalTime": "05:40"
                  },
                  {
                        "stopId": "s4",
                        "arrivalTime": "06:00"
                  },
                  {
                        "stopId": "s5",
                        "arrivalTime": "06:20"
                  }
            ]
      },
      {
            "tripId": "trip-2",
            "busId": "b2",
            "departureTime": "08:00",
            "arrivalTime": "09:20",
            "busType": "normal",
            "stopSchedules": [
                  {
                        "stopId": "s1",
                        "arrivalTime": "08:00"
                  },
                  {
                        "stopId": "s2",
                        "arrivalTime": "08:20"
                  },
                  {
                        "stopId": "s3",
                        "arrivalTime": "08:40"
                  },
                  {
                        "stopId": "s4",
                        "arrivalTime": "09:00"
                  },
                  {
                        "stopId": "s5",
                        "arrivalTime": "09:20"
                  }
            ]
      },
      {
            "tripId": "trip-3",
            "busId": "b3",
            "departureTime": "11:00",
            "arrivalTime": "12:20",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s1",
                        "arrivalTime": "11:00"
                  },
                  {
                        "stopId": "s2",
                        "arrivalTime": "11:20"
                  },
                  {
                        "stopId": "s3",
                        "arrivalTime": "11:40"
                  },
                  {
                        "stopId": "s4",
                        "arrivalTime": "12:00"
                  },
                  {
                        "stopId": "s5",
                        "arrivalTime": "12:20"
                  }
            ]
      },
      {
            "tripId": "trip-4",
            "busId": "b1",
            "departureTime": "14:00",
            "arrivalTime": "15:20",
            "busType": "normal",
            "stopSchedules": [
                  {
                        "stopId": "s1",
                        "arrivalTime": "14:00"
                  },
                  {
                        "stopId": "s2",
                        "arrivalTime": "14:20"
                  },
                  {
                        "stopId": "s3",
                        "arrivalTime": "14:40"
                  },
                  {
                        "stopId": "s4",
                        "arrivalTime": "15:00"
                  },
                  {
                        "stopId": "s5",
                        "arrivalTime": "15:20"
                  }
            ]
      },
      {
            "tripId": "trip-5",
            "busId": "b2",
            "departureTime": "17:00",
            "arrivalTime": "18:20",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s1",
                        "arrivalTime": "17:00"
                  },
                  {
                        "stopId": "s2",
                        "arrivalTime": "17:20"
                  },
                  {
                        "stopId": "s3",
                        "arrivalTime": "17:40"
                  },
                  {
                        "stopId": "s4",
                        "arrivalTime": "18:00"
                  },
                  {
                        "stopId": "s5",
                        "arrivalTime": "18:20"
                  }
            ]
      }
],
    weekend: [
      {
            "tripId": "trip-1",
            "busId": "b1",
            "departureTime": "05:00",
            "arrivalTime": "06:20",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s1",
                        "arrivalTime": "05:00"
                  },
                  {
                        "stopId": "s2",
                        "arrivalTime": "05:20"
                  },
                  {
                        "stopId": "s3",
                        "arrivalTime": "05:40"
                  },
                  {
                        "stopId": "s4",
                        "arrivalTime": "06:00"
                  },
                  {
                        "stopId": "s5",
                        "arrivalTime": "06:20"
                  }
            ]
      },
      {
            "tripId": "trip-2",
            "busId": "b2",
            "departureTime": "08:00",
            "arrivalTime": "09:20",
            "busType": "normal",
            "stopSchedules": [
                  {
                        "stopId": "s1",
                        "arrivalTime": "08:00"
                  },
                  {
                        "stopId": "s2",
                        "arrivalTime": "08:20"
                  },
                  {
                        "stopId": "s3",
                        "arrivalTime": "08:40"
                  },
                  {
                        "stopId": "s4",
                        "arrivalTime": "09:00"
                  },
                  {
                        "stopId": "s5",
                        "arrivalTime": "09:20"
                  }
            ]
      },
      {
            "tripId": "trip-3",
            "busId": "b3",
            "departureTime": "11:00",
            "arrivalTime": "12:20",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s1",
                        "arrivalTime": "11:00"
                  },
                  {
                        "stopId": "s2",
                        "arrivalTime": "11:20"
                  },
                  {
                        "stopId": "s3",
                        "arrivalTime": "11:40"
                  },
                  {
                        "stopId": "s4",
                        "arrivalTime": "12:00"
                  },
                  {
                        "stopId": "s5",
                        "arrivalTime": "12:20"
                  }
            ]
      }
]
  },

  "route-2": {
    routeId: "route-2",
    weekday: [
      {
            "tripId": "trip-6",
            "busId": "b4",
            "departureTime": "05:00",
            "arrivalTime": "06:20",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s6",
                        "arrivalTime": "05:00"
                  },
                  {
                        "stopId": "s7",
                        "arrivalTime": "05:20"
                  },
                  {
                        "stopId": "s8",
                        "arrivalTime": "05:40"
                  },
                  {
                        "stopId": "s9",
                        "arrivalTime": "06:00"
                  },
                  {
                        "stopId": "s10",
                        "arrivalTime": "06:20"
                  }
            ]
      },
      {
            "tripId": "trip-7",
            "busId": "b5",
            "departureTime": "08:00",
            "arrivalTime": "09:20",
            "busType": "normal",
            "stopSchedules": [
                  {
                        "stopId": "s6",
                        "arrivalTime": "08:00"
                  },
                  {
                        "stopId": "s7",
                        "arrivalTime": "08:20"
                  },
                  {
                        "stopId": "s8",
                        "arrivalTime": "08:40"
                  },
                  {
                        "stopId": "s9",
                        "arrivalTime": "09:00"
                  },
                  {
                        "stopId": "s10",
                        "arrivalTime": "09:20"
                  }
            ]
      },
      {
            "tripId": "trip-8",
            "busId": "b4",
            "departureTime": "11:00",
            "arrivalTime": "12:20",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s6",
                        "arrivalTime": "11:00"
                  },
                  {
                        "stopId": "s7",
                        "arrivalTime": "11:20"
                  },
                  {
                        "stopId": "s8",
                        "arrivalTime": "11:40"
                  },
                  {
                        "stopId": "s9",
                        "arrivalTime": "12:00"
                  },
                  {
                        "stopId": "s10",
                        "arrivalTime": "12:20"
                  }
            ]
      },
      {
            "tripId": "trip-9",
            "busId": "b5",
            "departureTime": "14:00",
            "arrivalTime": "15:20",
            "busType": "normal",
            "stopSchedules": [
                  {
                        "stopId": "s6",
                        "arrivalTime": "14:00"
                  },
                  {
                        "stopId": "s7",
                        "arrivalTime": "14:20"
                  },
                  {
                        "stopId": "s8",
                        "arrivalTime": "14:40"
                  },
                  {
                        "stopId": "s9",
                        "arrivalTime": "15:00"
                  },
                  {
                        "stopId": "s10",
                        "arrivalTime": "15:20"
                  }
            ]
      },
      {
            "tripId": "trip-10",
            "busId": "b4",
            "departureTime": "17:00",
            "arrivalTime": "18:20",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s6",
                        "arrivalTime": "17:00"
                  },
                  {
                        "stopId": "s7",
                        "arrivalTime": "17:20"
                  },
                  {
                        "stopId": "s8",
                        "arrivalTime": "17:40"
                  },
                  {
                        "stopId": "s9",
                        "arrivalTime": "18:00"
                  },
                  {
                        "stopId": "s10",
                        "arrivalTime": "18:20"
                  }
            ]
      }
],
    weekend: [
      {
            "tripId": "trip-6",
            "busId": "b4",
            "departureTime": "05:00",
            "arrivalTime": "06:20",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s6",
                        "arrivalTime": "05:00"
                  },
                  {
                        "stopId": "s7",
                        "arrivalTime": "05:20"
                  },
                  {
                        "stopId": "s8",
                        "arrivalTime": "05:40"
                  },
                  {
                        "stopId": "s9",
                        "arrivalTime": "06:00"
                  },
                  {
                        "stopId": "s10",
                        "arrivalTime": "06:20"
                  }
            ]
      },
      {
            "tripId": "trip-7",
            "busId": "b5",
            "departureTime": "08:00",
            "arrivalTime": "09:20",
            "busType": "normal",
            "stopSchedules": [
                  {
                        "stopId": "s6",
                        "arrivalTime": "08:00"
                  },
                  {
                        "stopId": "s7",
                        "arrivalTime": "08:20"
                  },
                  {
                        "stopId": "s8",
                        "arrivalTime": "08:40"
                  },
                  {
                        "stopId": "s9",
                        "arrivalTime": "09:00"
                  },
                  {
                        "stopId": "s10",
                        "arrivalTime": "09:20"
                  }
            ]
      },
      {
            "tripId": "trip-8",
            "busId": "b4",
            "departureTime": "11:00",
            "arrivalTime": "12:20",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s6",
                        "arrivalTime": "11:00"
                  },
                  {
                        "stopId": "s7",
                        "arrivalTime": "11:20"
                  },
                  {
                        "stopId": "s8",
                        "arrivalTime": "11:40"
                  },
                  {
                        "stopId": "s9",
                        "arrivalTime": "12:00"
                  },
                  {
                        "stopId": "s10",
                        "arrivalTime": "12:20"
                  }
            ]
      }
]
  },

  "route-3": {
    routeId: "route-3",
    weekday: [
      {
            "tripId": "trip-11",
            "busId": "b6",
            "departureTime": "05:00",
            "arrivalTime": "06:40",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s11",
                        "arrivalTime": "05:00"
                  },
                  {
                        "stopId": "s12",
                        "arrivalTime": "05:20"
                  },
                  {
                        "stopId": "s13",
                        "arrivalTime": "05:40"
                  },
                  {
                        "stopId": "s14",
                        "arrivalTime": "06:00"
                  },
                  {
                        "stopId": "s15",
                        "arrivalTime": "06:20"
                  },
                  {
                        "stopId": "s16",
                        "arrivalTime": "06:40"
                  }
            ]
      },
      {
            "tripId": "trip-12",
            "busId": "b7",
            "departureTime": "08:00",
            "arrivalTime": "09:40",
            "busType": "normal",
            "stopSchedules": [
                  {
                        "stopId": "s11",
                        "arrivalTime": "08:00"
                  },
                  {
                        "stopId": "s12",
                        "arrivalTime": "08:20"
                  },
                  {
                        "stopId": "s13",
                        "arrivalTime": "08:40"
                  },
                  {
                        "stopId": "s14",
                        "arrivalTime": "09:00"
                  },
                  {
                        "stopId": "s15",
                        "arrivalTime": "09:20"
                  },
                  {
                        "stopId": "s16",
                        "arrivalTime": "09:40"
                  }
            ]
      },
      {
            "tripId": "trip-13",
            "busId": "b6",
            "departureTime": "11:00",
            "arrivalTime": "12:40",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s11",
                        "arrivalTime": "11:00"
                  },
                  {
                        "stopId": "s12",
                        "arrivalTime": "11:20"
                  },
                  {
                        "stopId": "s13",
                        "arrivalTime": "11:40"
                  },
                  {
                        "stopId": "s14",
                        "arrivalTime": "12:00"
                  },
                  {
                        "stopId": "s15",
                        "arrivalTime": "12:20"
                  },
                  {
                        "stopId": "s16",
                        "arrivalTime": "12:40"
                  }
            ]
      },
      {
            "tripId": "trip-14",
            "busId": "b7",
            "departureTime": "14:00",
            "arrivalTime": "15:40",
            "busType": "normal",
            "stopSchedules": [
                  {
                        "stopId": "s11",
                        "arrivalTime": "14:00"
                  },
                  {
                        "stopId": "s12",
                        "arrivalTime": "14:20"
                  },
                  {
                        "stopId": "s13",
                        "arrivalTime": "14:40"
                  },
                  {
                        "stopId": "s14",
                        "arrivalTime": "15:00"
                  },
                  {
                        "stopId": "s15",
                        "arrivalTime": "15:20"
                  },
                  {
                        "stopId": "s16",
                        "arrivalTime": "15:40"
                  }
            ]
      },
      {
            "tripId": "trip-15",
            "busId": "b6",
            "departureTime": "17:00",
            "arrivalTime": "18:40",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s11",
                        "arrivalTime": "17:00"
                  },
                  {
                        "stopId": "s12",
                        "arrivalTime": "17:20"
                  },
                  {
                        "stopId": "s13",
                        "arrivalTime": "17:40"
                  },
                  {
                        "stopId": "s14",
                        "arrivalTime": "18:00"
                  },
                  {
                        "stopId": "s15",
                        "arrivalTime": "18:20"
                  },
                  {
                        "stopId": "s16",
                        "arrivalTime": "18:40"
                  }
            ]
      }
],
    weekend: [
      {
            "tripId": "trip-11",
            "busId": "b6",
            "departureTime": "05:00",
            "arrivalTime": "06:40",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s11",
                        "arrivalTime": "05:00"
                  },
                  {
                        "stopId": "s12",
                        "arrivalTime": "05:20"
                  },
                  {
                        "stopId": "s13",
                        "arrivalTime": "05:40"
                  },
                  {
                        "stopId": "s14",
                        "arrivalTime": "06:00"
                  },
                  {
                        "stopId": "s15",
                        "arrivalTime": "06:20"
                  },
                  {
                        "stopId": "s16",
                        "arrivalTime": "06:40"
                  }
            ]
      },
      {
            "tripId": "trip-12",
            "busId": "b7",
            "departureTime": "08:00",
            "arrivalTime": "09:40",
            "busType": "normal",
            "stopSchedules": [
                  {
                        "stopId": "s11",
                        "arrivalTime": "08:00"
                  },
                  {
                        "stopId": "s12",
                        "arrivalTime": "08:20"
                  },
                  {
                        "stopId": "s13",
                        "arrivalTime": "08:40"
                  },
                  {
                        "stopId": "s14",
                        "arrivalTime": "09:00"
                  },
                  {
                        "stopId": "s15",
                        "arrivalTime": "09:20"
                  },
                  {
                        "stopId": "s16",
                        "arrivalTime": "09:40"
                  }
            ]
      },
      {
            "tripId": "trip-13",
            "busId": "b6",
            "departureTime": "11:00",
            "arrivalTime": "12:40",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s11",
                        "arrivalTime": "11:00"
                  },
                  {
                        "stopId": "s12",
                        "arrivalTime": "11:20"
                  },
                  {
                        "stopId": "s13",
                        "arrivalTime": "11:40"
                  },
                  {
                        "stopId": "s14",
                        "arrivalTime": "12:00"
                  },
                  {
                        "stopId": "s15",
                        "arrivalTime": "12:20"
                  },
                  {
                        "stopId": "s16",
                        "arrivalTime": "12:40"
                  }
            ]
      }
]
  },

  "route-4": {
    routeId: "route-4",
    weekday: [
      {
            "tripId": "trip-16",
            "busId": "b8",
            "departureTime": "05:00",
            "arrivalTime": "06:20",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s17",
                        "arrivalTime": "05:00"
                  },
                  {
                        "stopId": "s18",
                        "arrivalTime": "05:20"
                  },
                  {
                        "stopId": "s19",
                        "arrivalTime": "05:40"
                  },
                  {
                        "stopId": "s20",
                        "arrivalTime": "06:00"
                  },
                  {
                        "stopId": "s21",
                        "arrivalTime": "06:20"
                  }
            ]
      },
      {
            "tripId": "trip-17",
            "busId": "b8",
            "departureTime": "08:00",
            "arrivalTime": "09:20",
            "busType": "normal",
            "stopSchedules": [
                  {
                        "stopId": "s17",
                        "arrivalTime": "08:00"
                  },
                  {
                        "stopId": "s18",
                        "arrivalTime": "08:20"
                  },
                  {
                        "stopId": "s19",
                        "arrivalTime": "08:40"
                  },
                  {
                        "stopId": "s20",
                        "arrivalTime": "09:00"
                  },
                  {
                        "stopId": "s21",
                        "arrivalTime": "09:20"
                  }
            ]
      },
      {
            "tripId": "trip-18",
            "busId": "b8",
            "departureTime": "11:00",
            "arrivalTime": "12:20",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s17",
                        "arrivalTime": "11:00"
                  },
                  {
                        "stopId": "s18",
                        "arrivalTime": "11:20"
                  },
                  {
                        "stopId": "s19",
                        "arrivalTime": "11:40"
                  },
                  {
                        "stopId": "s20",
                        "arrivalTime": "12:00"
                  },
                  {
                        "stopId": "s21",
                        "arrivalTime": "12:20"
                  }
            ]
      },
      {
            "tripId": "trip-19",
            "busId": "b8",
            "departureTime": "14:00",
            "arrivalTime": "15:20",
            "busType": "normal",
            "stopSchedules": [
                  {
                        "stopId": "s17",
                        "arrivalTime": "14:00"
                  },
                  {
                        "stopId": "s18",
                        "arrivalTime": "14:20"
                  },
                  {
                        "stopId": "s19",
                        "arrivalTime": "14:40"
                  },
                  {
                        "stopId": "s20",
                        "arrivalTime": "15:00"
                  },
                  {
                        "stopId": "s21",
                        "arrivalTime": "15:20"
                  }
            ]
      },
      {
            "tripId": "trip-20",
            "busId": "b8",
            "departureTime": "17:00",
            "arrivalTime": "18:20",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s17",
                        "arrivalTime": "17:00"
                  },
                  {
                        "stopId": "s18",
                        "arrivalTime": "17:20"
                  },
                  {
                        "stopId": "s19",
                        "arrivalTime": "17:40"
                  },
                  {
                        "stopId": "s20",
                        "arrivalTime": "18:00"
                  },
                  {
                        "stopId": "s21",
                        "arrivalTime": "18:20"
                  }
            ]
      }
],
    weekend: [
      {
            "tripId": "trip-16",
            "busId": "b8",
            "departureTime": "05:00",
            "arrivalTime": "06:20",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s17",
                        "arrivalTime": "05:00"
                  },
                  {
                        "stopId": "s18",
                        "arrivalTime": "05:20"
                  },
                  {
                        "stopId": "s19",
                        "arrivalTime": "05:40"
                  },
                  {
                        "stopId": "s20",
                        "arrivalTime": "06:00"
                  },
                  {
                        "stopId": "s21",
                        "arrivalTime": "06:20"
                  }
            ]
      },
      {
            "tripId": "trip-17",
            "busId": "b8",
            "departureTime": "08:00",
            "arrivalTime": "09:20",
            "busType": "normal",
            "stopSchedules": [
                  {
                        "stopId": "s17",
                        "arrivalTime": "08:00"
                  },
                  {
                        "stopId": "s18",
                        "arrivalTime": "08:20"
                  },
                  {
                        "stopId": "s19",
                        "arrivalTime": "08:40"
                  },
                  {
                        "stopId": "s20",
                        "arrivalTime": "09:00"
                  },
                  {
                        "stopId": "s21",
                        "arrivalTime": "09:20"
                  }
            ]
      },
      {
            "tripId": "trip-18",
            "busId": "b8",
            "departureTime": "11:00",
            "arrivalTime": "12:20",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s17",
                        "arrivalTime": "11:00"
                  },
                  {
                        "stopId": "s18",
                        "arrivalTime": "11:20"
                  },
                  {
                        "stopId": "s19",
                        "arrivalTime": "11:40"
                  },
                  {
                        "stopId": "s20",
                        "arrivalTime": "12:00"
                  },
                  {
                        "stopId": "s21",
                        "arrivalTime": "12:20"
                  }
            ]
      }
]
  },

  "route-5": {
    routeId: "route-5",
    weekday: [
      {
            "tripId": "trip-21",
            "busId": "b9",
            "departureTime": "05:00",
            "arrivalTime": "06:00",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s22",
                        "arrivalTime": "05:00"
                  },
                  {
                        "stopId": "s23",
                        "arrivalTime": "05:20"
                  },
                  {
                        "stopId": "s24",
                        "arrivalTime": "05:40"
                  },
                  {
                        "stopId": "s25",
                        "arrivalTime": "06:00"
                  }
            ]
      },
      {
            "tripId": "trip-22",
            "busId": "b10",
            "departureTime": "08:00",
            "arrivalTime": "09:00",
            "busType": "normal",
            "stopSchedules": [
                  {
                        "stopId": "s22",
                        "arrivalTime": "08:00"
                  },
                  {
                        "stopId": "s23",
                        "arrivalTime": "08:20"
                  },
                  {
                        "stopId": "s24",
                        "arrivalTime": "08:40"
                  },
                  {
                        "stopId": "s25",
                        "arrivalTime": "09:00"
                  }
            ]
      },
      {
            "tripId": "trip-23",
            "busId": "b9",
            "departureTime": "11:00",
            "arrivalTime": "12:00",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s22",
                        "arrivalTime": "11:00"
                  },
                  {
                        "stopId": "s23",
                        "arrivalTime": "11:20"
                  },
                  {
                        "stopId": "s24",
                        "arrivalTime": "11:40"
                  },
                  {
                        "stopId": "s25",
                        "arrivalTime": "12:00"
                  }
            ]
      },
      {
            "tripId": "trip-24",
            "busId": "b10",
            "departureTime": "14:00",
            "arrivalTime": "15:00",
            "busType": "normal",
            "stopSchedules": [
                  {
                        "stopId": "s22",
                        "arrivalTime": "14:00"
                  },
                  {
                        "stopId": "s23",
                        "arrivalTime": "14:20"
                  },
                  {
                        "stopId": "s24",
                        "arrivalTime": "14:40"
                  },
                  {
                        "stopId": "s25",
                        "arrivalTime": "15:00"
                  }
            ]
      },
      {
            "tripId": "trip-25",
            "busId": "b9",
            "departureTime": "17:00",
            "arrivalTime": "18:00",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s22",
                        "arrivalTime": "17:00"
                  },
                  {
                        "stopId": "s23",
                        "arrivalTime": "17:20"
                  },
                  {
                        "stopId": "s24",
                        "arrivalTime": "17:40"
                  },
                  {
                        "stopId": "s25",
                        "arrivalTime": "18:00"
                  }
            ]
      }
],
    weekend: [
      {
            "tripId": "trip-21",
            "busId": "b9",
            "departureTime": "05:00",
            "arrivalTime": "06:00",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s22",
                        "arrivalTime": "05:00"
                  },
                  {
                        "stopId": "s23",
                        "arrivalTime": "05:20"
                  },
                  {
                        "stopId": "s24",
                        "arrivalTime": "05:40"
                  },
                  {
                        "stopId": "s25",
                        "arrivalTime": "06:00"
                  }
            ]
      },
      {
            "tripId": "trip-22",
            "busId": "b10",
            "departureTime": "08:00",
            "arrivalTime": "09:00",
            "busType": "normal",
            "stopSchedules": [
                  {
                        "stopId": "s22",
                        "arrivalTime": "08:00"
                  },
                  {
                        "stopId": "s23",
                        "arrivalTime": "08:20"
                  },
                  {
                        "stopId": "s24",
                        "arrivalTime": "08:40"
                  },
                  {
                        "stopId": "s25",
                        "arrivalTime": "09:00"
                  }
            ]
      },
      {
            "tripId": "trip-23",
            "busId": "b9",
            "departureTime": "11:00",
            "arrivalTime": "12:00",
            "busType": "express",
            "stopSchedules": [
                  {
                        "stopId": "s22",
                        "arrivalTime": "11:00"
                  },
                  {
                        "stopId": "s23",
                        "arrivalTime": "11:20"
                  },
                  {
                        "stopId": "s24",
                        "arrivalTime": "11:40"
                  },
                  {
                        "stopId": "s25",
                        "arrivalTime": "12:00"
                  }
            ]
      }
]
  },

};
