/* 本项目为非官方辅助工具，模板参数根据公开信息整理。部分特殊计算规则尚未完全验证，实际比赛结果请以官方平台为准。 */
(function(g){const data={
  "parameters": {
    "template_id": "diecui_a",
    "name": "叠翠A",
    "currency": "CNY",
    "amount_unit": "元",
    "quantity_unit": "套",
    "scale": 1,
    "initial_cash": "3000000",
    "vat_rate": "0.13",
    "income_tax_rate": "0.25",
    "business_tax_rate": "0",
    "surcharge_rates": {
      "city": "0.07",
      "education": "0.03",
      "local_education": "0.02"
    },
    "loans": {
      "short": {
        "rate": "0.05",
        "term_quarters": 2
      },
      "long": {
        "rate": "0.08",
        "term_quarters": 4
      }
    },
    "emergency_loan": {
      "rate": "0.4",
      "term_quarters": 3,
      "mode": "显示风险，不自动借入"
    },
    "discount_rates_by_remaining_quarters": {
      "1": "0.02",
      "2": "0.04",
      "3": "0.06",
      "4": "0.08"
    },
    "factory": {
      "purchase_price": "500000",
      "rent_per_quarter": "40000",
      "finance_price": "500000",
      "finance_term_quarters": 4,
      "finance_interest_rate": "0.05",
      "depreciation_rate": "0.05",
      "default_slots": 6
    },
    "administration": {
      "base": "100000",
      "per_owned_line_including_installation": "30000"
    },
    "equipment": [
      {
        "id": "H1",
        "product": "high",
        "price": "1200000",
        "depreciation_rate": "0.1",
        "maintenance_per_quarter": "60000",
        "installation_quarters": 1,
        "capacity": "1200",
        "worker_wage": "90000",
        "worker_recruit_training_fee": "30000",
        "worker_capacity": "1200",
        "worker_training_quarters": 1,
        "first_depreciation_maintenance_age": 1,
        "source": "Sheet1!B11:G11;B18:F18"
      },
      {
        "id": "H2",
        "product": "high",
        "price": "900000",
        "depreciation_rate": "0.1",
        "maintenance_per_quarter": "60000",
        "installation_quarters": 0,
        "capacity": "800",
        "worker_wage": "90000",
        "worker_recruit_training_fee": "30000",
        "worker_capacity": "800",
        "worker_training_quarters": 0,
        "first_depreciation_maintenance_age": 1,
        "source": "Sheet1!B12:G12;B19:F19"
      },
      {
        "id": "M1",
        "product": "mid",
        "price": "800000",
        "depreciation_rate": "0.1",
        "maintenance_per_quarter": "40000",
        "installation_quarters": 1,
        "capacity": "700",
        "worker_wage": "60000",
        "worker_recruit_training_fee": "20000",
        "worker_capacity": "700",
        "worker_training_quarters": 1,
        "first_depreciation_maintenance_age": 1,
        "source": "Sheet1!B13:G13;B20:F20"
      },
      {
        "id": "M2",
        "product": "mid",
        "price": "600000",
        "depreciation_rate": "0.1",
        "maintenance_per_quarter": "40000",
        "installation_quarters": 0,
        "capacity": "500",
        "worker_wage": "60000",
        "worker_recruit_training_fee": "20000",
        "worker_capacity": "500",
        "worker_training_quarters": 0,
        "first_depreciation_maintenance_age": 1,
        "source": "Sheet1!B14:G14;B21:F21"
      },
      {
        "id": "L1",
        "product": "low",
        "price": "500000",
        "depreciation_rate": "0.1",
        "maintenance_per_quarter": "20000",
        "installation_quarters": 0,
        "capacity": "500",
        "worker_wage": "30000",
        "worker_recruit_training_fee": "10000",
        "worker_capacity": "500",
        "worker_training_quarters": 0,
        "first_depreciation_maintenance_age": 1,
        "source": "Sheet1!B15:G15;B22:F22"
      },
      {
        "id": "L2",
        "product": "low",
        "price": "300000",
        "depreciation_rate": "0.1",
        "maintenance_per_quarter": "20000",
        "installation_quarters": 0,
        "capacity": "300",
        "worker_wage": "30000",
        "worker_recruit_training_fee": "10000",
        "worker_capacity": "300",
        "worker_training_quarters": 0,
        "first_depreciation_maintenance_age": 1,
        "source": "Sheet1!B16:G16;B23:F23"
      }
    ],
    "sales_staff": [
      {
        "id": "A",
        "wage": "15000",
        "recruit_fee": "5000",
        "training_quarters": 0
      },
      {
        "id": "B",
        "wage": "25000",
        "recruit_fee": "10000",
        "training_quarters": 1
      }
    ],
    "products": [
      {
        "id": "high",
        "price_ceiling": "1500",
        "material_unit_price": "600",
        "material_credit_quarters": 2,
        "processing_per_unit": "60"
      },
      {
        "id": "mid",
        "price_ceiling": "1200",
        "material_unit_price": "400",
        "material_credit_quarters": 1,
        "processing_per_unit": "40"
      },
      {
        "id": "low",
        "price_ceiling": "750",
        "material_unit_price": "200",
        "material_credit_quarters": 0,
        "processing_per_unit": "20"
      }
    ],
    "market_orders": [
      {
        "id": "DCA-Q1-R41",
        "quarter": 1,
        "product": "high",
        "price_weight": "0.5",
        "ad_weight": "0.5",
        "lag": 2,
        "price_ceiling": "1500",
        "mean_order": "400",
        "source": "Sheet1!A41:G41"
      },
      {
        "id": "DCA-Q1-R42",
        "quarter": 1,
        "product": "mid",
        "price_weight": "0.6",
        "ad_weight": "0.4",
        "lag": 2,
        "price_ceiling": "1200",
        "mean_order": "500",
        "source": "Sheet1!A42:G42"
      },
      {
        "id": "DCA-Q1-R43",
        "quarter": 1,
        "product": "low",
        "price_weight": "0.7",
        "ad_weight": "0.3",
        "lag": 0,
        "price_ceiling": "750",
        "mean_order": "600",
        "source": "Sheet1!A43:G43"
      },
      {
        "id": "DCA-Q1-R44",
        "quarter": 1,
        "product": "low",
        "price_weight": "0.6",
        "ad_weight": "0.4",
        "lag": 1,
        "price_ceiling": "750",
        "mean_order": "800",
        "source": "Sheet1!A44:G44"
      },
      {
        "id": "DCA-Q2-R48",
        "quarter": 2,
        "product": "high",
        "price_weight": "0.5",
        "ad_weight": "0.5",
        "lag": 2,
        "price_ceiling": "1400",
        "mean_order": "700",
        "source": "Sheet1!A48:G48"
      },
      {
        "id": "DCA-Q2-R49",
        "quarter": 2,
        "product": "mid",
        "price_weight": "0.6",
        "ad_weight": "0.4",
        "lag": 1,
        "price_ceiling": "1000",
        "mean_order": "900",
        "source": "Sheet1!A49:G49"
      },
      {
        "id": "DCA-Q2-R50",
        "quarter": 2,
        "product": "low",
        "price_weight": "0.7",
        "ad_weight": "0.3",
        "lag": 0,
        "price_ceiling": "700",
        "mean_order": "600",
        "source": "Sheet1!A50:G50"
      },
      {
        "id": "DCA-Q2-R51",
        "quarter": 2,
        "product": "low",
        "price_weight": "0.7",
        "ad_weight": "0.3",
        "lag": 0,
        "price_ceiling": "700",
        "mean_order": "400",
        "source": "Sheet1!A51:G51"
      },
      {
        "id": "DCA-Q2-R52",
        "quarter": 2,
        "product": "low",
        "price_weight": "0.6",
        "ad_weight": "0.4",
        "lag": 1,
        "price_ceiling": "750",
        "mean_order": "800",
        "source": "Sheet1!A52:G52"
      },
      {
        "id": "DCA-Q3-R56",
        "quarter": 3,
        "product": "high",
        "price_weight": "0.4",
        "ad_weight": "0.6",
        "lag": 2,
        "price_ceiling": "1500",
        "mean_order": "500",
        "source": "Sheet1!A56:G56"
      },
      {
        "id": "DCA-Q3-R57",
        "quarter": 3,
        "product": "high",
        "price_weight": "0.5",
        "ad_weight": "0.5",
        "lag": 1,
        "price_ceiling": "1400",
        "mean_order": "700",
        "source": "Sheet1!A57:G57"
      },
      {
        "id": "DCA-Q3-R58",
        "quarter": 3,
        "product": "mid",
        "price_weight": "0.5",
        "ad_weight": "0.5",
        "lag": 2,
        "price_ceiling": "1200",
        "mean_order": "700",
        "source": "Sheet1!A58:G58"
      },
      {
        "id": "DCA-Q3-R59",
        "quarter": 3,
        "product": "mid",
        "price_weight": "0.6",
        "ad_weight": "0.4",
        "lag": 1,
        "price_ceiling": "1000",
        "mean_order": "900",
        "source": "Sheet1!A59:G59"
      },
      {
        "id": "DCA-Q3-R60",
        "quarter": 3,
        "product": "low",
        "price_weight": "0.7",
        "ad_weight": "0.3",
        "lag": 0,
        "price_ceiling": "700",
        "mean_order": "800",
        "source": "Sheet1!A60:G60"
      },
      {
        "id": "DCA-Q3-R61",
        "quarter": 3,
        "product": "low",
        "price_weight": "0.6",
        "ad_weight": "0.4",
        "lag": 1,
        "price_ceiling": "720",
        "mean_order": "800",
        "source": "Sheet1!A61:G61"
      },
      {
        "id": "DCA-Q3-R62",
        "quarter": 3,
        "product": "low",
        "price_weight": "0.55",
        "ad_weight": "0.45",
        "lag": 2,
        "price_ceiling": "750",
        "mean_order": "600",
        "source": "Sheet1!A62:G62"
      },
      {
        "id": "DCA-Q4-R66",
        "quarter": 4,
        "product": "high",
        "price_weight": "0.5",
        "ad_weight": "0.5",
        "lag": 1,
        "price_ceiling": "1400",
        "mean_order": "300",
        "source": "Sheet1!A66:G66"
      },
      {
        "id": "DCA-Q4-R67",
        "quarter": 4,
        "product": "high",
        "price_weight": "0.4",
        "ad_weight": "0.6",
        "lag": 2,
        "price_ceiling": "1500",
        "mean_order": "400",
        "source": "Sheet1!A67:G67"
      },
      {
        "id": "DCA-Q4-R68",
        "quarter": 4,
        "product": "mid",
        "price_weight": "0.6",
        "ad_weight": "0.4",
        "lag": 1,
        "price_ceiling": "1000",
        "mean_order": "400",
        "source": "Sheet1!A68:G68"
      },
      {
        "id": "DCA-Q4-R69",
        "quarter": 4,
        "product": "mid",
        "price_weight": "0.5",
        "ad_weight": "0.5",
        "lag": 2,
        "price_ceiling": "1200",
        "mean_order": "400",
        "source": "Sheet1!A69:G69"
      },
      {
        "id": "DCA-Q4-R70",
        "quarter": 4,
        "product": "low",
        "price_weight": "0.7",
        "ad_weight": "0.3",
        "lag": 0,
        "price_ceiling": "700",
        "mean_order": "400",
        "source": "Sheet1!A70:G70"
      },
      {
        "id": "DCA-Q4-R71",
        "quarter": 4,
        "product": "low",
        "price_weight": "0.55",
        "ad_weight": "0.45",
        "lag": 1,
        "price_ceiling": "720",
        "mean_order": "600",
        "source": "Sheet1!A71:G71"
      },
      {
        "id": "DCA-Q4-R72",
        "quarter": 4,
        "product": "low",
        "price_weight": "0.6",
        "ad_weight": "0.4",
        "lag": 2,
        "price_ceiling": "750",
        "mean_order": "500",
        "source": "Sheet1!A72:G72"
      }
    ],
    "default_penalty_rate": "0.3",
    "rounding": {
      "internal": "exact_rational",
      "platform_midpoint_policy": "未确认"
    },
    "strategic_constraints": {
      "material_purchase_equals_production": true
    }
  },
  "presets": {
    "blank": {
      "name": "叠翠A · 新的一局",
      "factories": [],
      "lines": [],
      "quarters": [
        {
          "quarter": 1,
          "stage": "预计",
          "group_count": null,
          "loans": {
            "short": 0,
            "long": 0
          },
          "sales": {
            "A": 0,
            "B": 0
          },
          "orders": [
            {
              "id": "DCA-Q1-R41",
              "product": "high",
              "demand": null,
              "lag": 2,
              "price": "1500",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "DCA-Q1-R42",
              "product": "mid",
              "demand": null,
              "lag": 2,
              "price": "1200",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "DCA-Q1-R43",
              "product": "low",
              "demand": null,
              "lag": 0,
              "price": "750",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "DCA-Q1-R44",
              "product": "low",
              "demand": null,
              "lag": 1,
              "price": "750",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            }
          ],
          "discounts": []
        },
        {
          "quarter": 2,
          "stage": "预计",
          "group_count": null,
          "loans": {
            "short": 0,
            "long": 0
          },
          "sales": {
            "A": 0,
            "B": 0
          },
          "orders": [
            {
              "id": "DCA-Q2-R48",
              "product": "high",
              "demand": null,
              "lag": 2,
              "price": "1400",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "DCA-Q2-R49",
              "product": "mid",
              "demand": null,
              "lag": 1,
              "price": "1000",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "DCA-Q2-R50",
              "product": "low",
              "demand": null,
              "lag": 0,
              "price": "700",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "DCA-Q2-R51",
              "product": "low",
              "demand": null,
              "lag": 0,
              "price": "700",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "DCA-Q2-R52",
              "product": "low",
              "demand": null,
              "lag": 1,
              "price": "750",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            }
          ],
          "discounts": []
        },
        {
          "quarter": 3,
          "stage": "预计",
          "group_count": null,
          "loans": {
            "short": 0,
            "long": 0
          },
          "sales": {
            "A": 0,
            "B": 0
          },
          "orders": [
            {
              "id": "DCA-Q3-R56",
              "product": "high",
              "demand": null,
              "lag": 2,
              "price": "1500",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "DCA-Q3-R57",
              "product": "high",
              "demand": null,
              "lag": 1,
              "price": "1400",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "DCA-Q3-R58",
              "product": "mid",
              "demand": null,
              "lag": 2,
              "price": "1200",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "DCA-Q3-R59",
              "product": "mid",
              "demand": null,
              "lag": 1,
              "price": "1000",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "DCA-Q3-R60",
              "product": "low",
              "demand": null,
              "lag": 0,
              "price": "700",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "DCA-Q3-R61",
              "product": "low",
              "demand": null,
              "lag": 1,
              "price": "720",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "DCA-Q3-R62",
              "product": "low",
              "demand": null,
              "lag": 2,
              "price": "750",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            }
          ],
          "discounts": []
        },
        {
          "quarter": 4,
          "stage": "预计",
          "group_count": null,
          "loans": {
            "short": 0,
            "long": 0
          },
          "sales": {
            "A": 0,
            "B": 0
          },
          "orders": [
            {
              "id": "DCA-Q4-R66",
              "product": "high",
              "demand": null,
              "lag": 1,
              "price": "1400",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "DCA-Q4-R67",
              "product": "high",
              "demand": null,
              "lag": 2,
              "price": "1500",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "DCA-Q4-R68",
              "product": "mid",
              "demand": null,
              "lag": 1,
              "price": "1000",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "DCA-Q4-R69",
              "product": "mid",
              "demand": null,
              "lag": 2,
              "price": "1200",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "DCA-Q4-R70",
              "product": "low",
              "demand": null,
              "lag": 0,
              "price": "700",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "DCA-Q4-R71",
              "product": "low",
              "demand": null,
              "lag": 1,
              "price": "720",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "DCA-Q4-R72",
              "product": "low",
              "demand": null,
              "lag": 2,
              "price": "750",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            }
          ],
          "discounts": []
        }
      ],
      "snapshots": {}
    }
  },
  "default_preset": "blank",
  "preset_labels": {
    "blank": "空白建设（自行录入）"
  },
  "source": {
    "basis": "模板参数根据公开信息整理（非官方公开测试版）",
    "rights": "project-license:PolyForm-Noncommercial-1.0.0;third-party-rights-not-granted"
  }
};if(typeof module!=="undefined")module.exports=data;else g.DiecuiAData=data;})(globalThis);
