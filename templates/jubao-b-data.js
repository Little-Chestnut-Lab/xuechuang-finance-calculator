/* 本项目为非官方辅助工具，模板参数根据公开信息整理。部分特殊计算规则尚未完全验证，实际比赛结果请以官方平台为准。 */
(function(g){const data={
  "parameters": {
    "template_id": "jubao_b",
    "name": "聚宝B",
    "currency": "CNY",
    "amount_unit": "元",
    "quantity_unit": "套",
    "scale": 1,
    "initial_cash": "1000000",
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
        "rate": "0.1",
        "term_quarters": 4
      }
    },
    "emergency_loan": {
      "rate": "0.2",
      "term_quarters": 3,
      "mode": "显示风险，不自动借入"
    },
    "discount_rates_by_remaining_quarters": {
      "1": "0.03",
      "2": "0.05",
      "3": "0.07",
      "4": "0.08"
    },
    "factory": {
      "purchase_price": "240000",
      "rent_per_quarter": "20000",
      "finance_price": "240000",
      "finance_term_quarters": 4,
      "finance_interest_rate": "0.05",
      "depreciation_rate": "0.05",
      "default_slots": 4
    },
    "administration": {
      "base": "50000",
      "per_owned_line_including_installation": "10000"
    },
    "equipment": [
      {
        "id": "H1",
        "product": "high",
        "price": "350000",
        "depreciation_rate": "0.1",
        "maintenance_per_quarter": "20000",
        "installation_quarters": 1,
        "capacity": "1000",
        "worker_wage": "30000",
        "worker_recruit_training_fee": "9000",
        "worker_capacity": "1000",
        "worker_training_quarters": 1,
        "first_depreciation_maintenance_age": 1,
        "source": "Sheet1!B11:G11;B18:F18"
      },
      {
        "id": "H2",
        "product": "high",
        "price": "200000",
        "depreciation_rate": "0.1",
        "maintenance_per_quarter": "20000",
        "installation_quarters": 1,
        "capacity": "600",
        "worker_wage": "30000",
        "worker_recruit_training_fee": "9000",
        "worker_capacity": "600",
        "worker_training_quarters": 1,
        "first_depreciation_maintenance_age": 1,
        "source": "Sheet1!B12:G12;B19:F19"
      },
      {
        "id": "M1",
        "product": "mid",
        "price": "300000",
        "depreciation_rate": "0.1",
        "maintenance_per_quarter": "15000",
        "installation_quarters": 1,
        "capacity": "800",
        "worker_wage": "20000",
        "worker_recruit_training_fee": "6000",
        "worker_capacity": "800",
        "worker_training_quarters": 1,
        "first_depreciation_maintenance_age": 1,
        "source": "Sheet1!B13:G13;B20:F20"
      },
      {
        "id": "M2",
        "product": "mid",
        "price": "180000",
        "depreciation_rate": "0.1",
        "maintenance_per_quarter": "15000",
        "installation_quarters": 1,
        "capacity": "500",
        "worker_wage": "20000",
        "worker_recruit_training_fee": "6000",
        "worker_capacity": "500",
        "worker_training_quarters": 1,
        "first_depreciation_maintenance_age": 1,
        "source": "Sheet1!B14:G14;B21:F21"
      },
      {
        "id": "L1",
        "product": "low",
        "price": "200000",
        "depreciation_rate": "0.1",
        "maintenance_per_quarter": "10000",
        "installation_quarters": 0,
        "capacity": "550",
        "worker_wage": "15000",
        "worker_recruit_training_fee": "3000",
        "worker_capacity": "550",
        "worker_training_quarters": 0,
        "first_depreciation_maintenance_age": 1,
        "source": "Sheet1!B15:G15;B22:F22"
      },
      {
        "id": "L2",
        "product": "low",
        "price": "120000",
        "depreciation_rate": "0.1",
        "maintenance_per_quarter": "10000",
        "installation_quarters": 0,
        "capacity": "350",
        "worker_wage": "15000",
        "worker_recruit_training_fee": "3000",
        "worker_capacity": "350",
        "worker_training_quarters": 0,
        "first_depreciation_maintenance_age": 1,
        "source": "Sheet1!B16:G16;B23:F23"
      }
    ],
    "sales_staff": [
      {
        "id": "A",
        "wage": "15000",
        "recruit_fee": "3000",
        "training_quarters": 0
      },
      {
        "id": "B",
        "wage": "25000",
        "recruit_fee": "5000",
        "training_quarters": 0
      }
    ],
    "products": [
      {
        "id": "high",
        "price_ceiling": "1400",
        "material_unit_price": "600",
        "material_credit_quarters": 2,
        "processing_per_unit": "60"
      },
      {
        "id": "mid",
        "price_ceiling": "1000",
        "material_unit_price": "400",
        "material_credit_quarters": 1,
        "processing_per_unit": "40"
      },
      {
        "id": "low",
        "price_ceiling": "700",
        "material_unit_price": "250",
        "material_credit_quarters": 0,
        "processing_per_unit": "25"
      }
    ],
    "market_orders": [
      {
        "id": "JBB-Q1-R41",
        "quarter": 1,
        "product": "high",
        "lag": 2,
        "price_weight": "0.5",
        "ad_weight": "0.5",
        "price_ceiling": "1400",
        "mean_order": "400",
        "source": "Sheet1!A41:H41"
      },
      {
        "id": "JBB-Q1-R42",
        "quarter": 1,
        "product": "mid",
        "lag": 2,
        "price_weight": "0.6",
        "ad_weight": "0.4",
        "price_ceiling": "1000",
        "mean_order": "500",
        "source": "Sheet1!A42:H42"
      },
      {
        "id": "JBB-Q1-R43",
        "quarter": 1,
        "product": "low",
        "lag": 0,
        "price_weight": "0.7",
        "ad_weight": "0.3",
        "price_ceiling": "700",
        "mean_order": "300",
        "source": "Sheet1!A43:H43"
      },
      {
        "id": "JBB-Q1-R44",
        "quarter": 1,
        "product": "low",
        "lag": 1,
        "price_weight": "0.7",
        "ad_weight": "0.3",
        "price_ceiling": "700",
        "mean_order": "400",
        "source": "Sheet1!A44:H44"
      },
      {
        "id": "JBB-Q2-R48",
        "quarter": 2,
        "product": "high",
        "lag": 2,
        "price_weight": "0.5",
        "ad_weight": "0.5",
        "price_ceiling": "1400",
        "mean_order": "400",
        "source": "Sheet1!A48:H48"
      },
      {
        "id": "JBB-Q2-R49",
        "quarter": 2,
        "product": "mid",
        "lag": 1,
        "price_weight": "0.6",
        "ad_weight": "0.4",
        "price_ceiling": "1000",
        "mean_order": "500",
        "source": "Sheet1!A49:H49"
      },
      {
        "id": "JBB-Q2-R50",
        "quarter": 2,
        "product": "low",
        "lag": 1,
        "price_weight": "0.7",
        "ad_weight": "0.3",
        "price_ceiling": "700",
        "mean_order": "400",
        "source": "Sheet1!A50:H50"
      },
      {
        "id": "JBB-Q2-R51",
        "quarter": 2,
        "product": "low",
        "lag": 0,
        "price_weight": "0.7",
        "ad_weight": "0.3",
        "price_ceiling": "700",
        "mean_order": "200",
        "source": "Sheet1!A51:H51"
      },
      {
        "id": "JBB-Q2-R52",
        "quarter": 2,
        "product": "low",
        "lag": 0,
        "price_weight": "0.7",
        "ad_weight": "0.3",
        "price_ceiling": "700",
        "mean_order": "300",
        "source": "Sheet1!A52:H52"
      },
      {
        "id": "JBB-Q3-R56",
        "quarter": 3,
        "product": "high",
        "lag": 1,
        "price_weight": "0.5",
        "ad_weight": "0.5",
        "price_ceiling": "1400",
        "mean_order": "400",
        "source": "Sheet1!A56:H56"
      },
      {
        "id": "JBB-Q3-R57",
        "quarter": 3,
        "product": "high",
        "lag": 2,
        "price_weight": "0.5",
        "ad_weight": "0.5",
        "price_ceiling": "1400",
        "mean_order": "300",
        "source": "Sheet1!A57:H57"
      },
      {
        "id": "JBB-Q3-R58",
        "quarter": 3,
        "product": "mid",
        "lag": 1,
        "price_weight": "0.6",
        "ad_weight": "0.4",
        "price_ceiling": "1000",
        "mean_order": "500",
        "source": "Sheet1!A58:H58"
      },
      {
        "id": "JBB-Q3-R59",
        "quarter": 3,
        "product": "mid",
        "lag": 2,
        "price_weight": "0.6",
        "ad_weight": "0.4",
        "price_ceiling": "1000",
        "mean_order": "400",
        "source": "Sheet1!A59:H59"
      },
      {
        "id": "JBB-Q3-R60",
        "quarter": 3,
        "product": "low",
        "lag": 2,
        "price_weight": "0.7",
        "ad_weight": "0.3",
        "price_ceiling": "680",
        "mean_order": "500",
        "source": "Sheet1!A60:H60"
      },
      {
        "id": "JBB-Q3-R61",
        "quarter": 3,
        "product": "low",
        "lag": 1,
        "price_weight": "0.7",
        "ad_weight": "0.3",
        "price_ceiling": "680",
        "mean_order": "400",
        "source": "Sheet1!A61:H61"
      },
      {
        "id": "JBB-Q3-R62",
        "quarter": 3,
        "product": "low",
        "lag": 0,
        "price_weight": "0.7",
        "ad_weight": "0.3",
        "price_ceiling": "680",
        "mean_order": "300",
        "source": "Sheet1!A62:H62"
      },
      {
        "id": "JBB-Q4-R66",
        "quarter": 4,
        "product": "high",
        "lag": 2,
        "price_weight": "0.5",
        "ad_weight": "0.5",
        "price_ceiling": "1400",
        "mean_order": "300",
        "source": "Sheet1!A66:H66"
      },
      {
        "id": "JBB-Q4-R67",
        "quarter": 4,
        "product": "high",
        "lag": 1,
        "price_weight": "0.5",
        "ad_weight": "0.5",
        "price_ceiling": "1400",
        "mean_order": "200",
        "source": "Sheet1!A67:H67"
      },
      {
        "id": "JBB-Q4-R68",
        "quarter": 4,
        "product": "mid",
        "lag": 2,
        "price_weight": "0.6",
        "ad_weight": "0.4",
        "price_ceiling": "1000",
        "mean_order": "400",
        "source": "Sheet1!A68:H68"
      },
      {
        "id": "JBB-Q4-R69",
        "quarter": 4,
        "product": "mid",
        "lag": 1,
        "price_weight": "0.6",
        "ad_weight": "0.4",
        "price_ceiling": "1000",
        "mean_order": "300",
        "source": "Sheet1!A69:H69"
      },
      {
        "id": "JBB-Q4-R70",
        "quarter": 4,
        "product": "low",
        "lag": 2,
        "price_weight": "0.7",
        "ad_weight": "0.3",
        "price_ceiling": "680",
        "mean_order": "500",
        "source": "Sheet1!A70:H70"
      },
      {
        "id": "JBB-Q4-R71",
        "quarter": 4,
        "product": "low",
        "lag": 1,
        "price_weight": "0.7",
        "ad_weight": "0.3",
        "price_ceiling": "680",
        "mean_order": "600",
        "source": "Sheet1!A71:H71"
      },
      {
        "id": "JBB-Q4-R72",
        "quarter": 4,
        "product": "low",
        "lag": 0,
        "price_weight": "0.7",
        "ad_weight": "0.3",
        "price_ceiling": "680",
        "mean_order": "400",
        "source": "Sheet1!A72:H72"
      }
    ],
    "default_penalty_rate": "0.3",
    "rounding": {
      "internal": "exact_rational",
      "platform_midpoint_policy": "未确认"
    },
    "strategic_constraints": {
      "material_purchase_equals_production": true
    },
    "loan_limit_reference": {
      "short_same_period_max": "300000",
      "long_equity_ratio": "0.5",
      "mode": "额度以比赛系统为准，不自动估算权益授信"
    },
    "excluded_modules": [
      "股票",
      "债券"
    ]
  },
  "presets": {
    "blank": {
      "name": "聚宝B · 新的一局",
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
              "id": "JBB-Q1-R41",
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
              "id": "JBB-Q1-R42",
              "product": "mid",
              "demand": null,
              "lag": 2,
              "price": "1000",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JBB-Q1-R43",
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
              "id": "JBB-Q1-R44",
              "product": "low",
              "demand": null,
              "lag": 1,
              "price": "700",
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
              "id": "JBB-Q2-R48",
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
              "id": "JBB-Q2-R49",
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
              "id": "JBB-Q2-R50",
              "product": "low",
              "demand": null,
              "lag": 1,
              "price": "700",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JBB-Q2-R51",
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
              "id": "JBB-Q2-R52",
              "product": "low",
              "demand": null,
              "lag": 0,
              "price": "700",
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
              "id": "JBB-Q3-R56",
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
              "id": "JBB-Q3-R57",
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
              "id": "JBB-Q3-R58",
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
              "id": "JBB-Q3-R59",
              "product": "mid",
              "demand": null,
              "lag": 2,
              "price": "1000",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JBB-Q3-R60",
              "product": "low",
              "demand": null,
              "lag": 2,
              "price": "680",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JBB-Q3-R61",
              "product": "low",
              "demand": null,
              "lag": 1,
              "price": "680",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JBB-Q3-R62",
              "product": "low",
              "demand": null,
              "lag": 0,
              "price": "680",
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
              "id": "JBB-Q4-R66",
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
              "id": "JBB-Q4-R67",
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
              "id": "JBB-Q4-R68",
              "product": "mid",
              "demand": null,
              "lag": 2,
              "price": "1000",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JBB-Q4-R69",
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
              "id": "JBB-Q4-R70",
              "product": "low",
              "demand": null,
              "lag": 2,
              "price": "680",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JBB-Q4-R71",
              "product": "low",
              "demand": null,
              "lag": 1,
              "price": "680",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JBB-Q4-R72",
              "product": "low",
              "demand": null,
              "lag": 0,
              "price": "680",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            }
          ],
          "discounts": []
        }
      ],
      "snapshots": {},
      "market_mode": "rules"
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
};if(typeof module!=="undefined")module.exports=data;else g.JubaoBData=data;})(globalThis);
