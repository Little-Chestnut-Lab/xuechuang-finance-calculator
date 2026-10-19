/* 本项目为非官方辅助工具，模板参数根据公开信息整理。部分特殊计算规则尚未完全验证，实际比赛结果请以官方平台为准。 */
(function(g){const data={
  "parameters": {
    "template_id": "jiyu_b",
    "name": "积玉B",
    "currency": "CNY",
    "amount_unit": "元",
    "quantity_unit": "套",
    "scale": 1,
    "initial_cash": "30",
    "vat_rate": "0.13",
    "income_tax_rate": "0.25",
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
      },
      "interest_timing": "drawdown_once",
      "limit_source": "比赛系统给出；不实现额度推导"
    },
    "discount_rates_by_remaining_quarters": {
      "1": "0.03",
      "2": "0.05",
      "3": "0.07"
    },
    "factory": {
      "purchase_price": "12",
      "rent_per_quarter": "4",
      "finance_price": "12",
      "finance_term_quarters": 4,
      "finance_interest_rate": "0.05",
      "depreciation_rate": "0.05",
      "default_slots": 4,
      "slots_source": "默认4条；其他模板容量可为6条，容量字段可配置。此项为模板配置说明。",
      "finance_payment_timing": "acquisition_quarter_end_and_each_quarter_until_term_end",
      "finance_depreciation_start": "quarter_after_acquisition",
      "purchase_depreciation_start": "quarter_after_acquisition；取得后下一季度起计提折旧，购置厂房场景尚未完成平台验证",
      "idle_rental_rule": "整间厂房没有生产且只有安装线时，租金计管理费用；此为当前实现口径，不表示完成全部平台场景验证"
    },
    "administration": {
      "base": "1",
      "per_owned_line_including_installation": "1",
      "source": {
        "cell": "第一季度!AB52",
        "source": "=1+1*SUM(H11:H16)",
        "cached": 4
      }
    },
    "equipment": [
      {
        "id": "H1",
        "product": "high",
        "price": "11",
        "depreciation_rate": "0.1",
        "maintenance_per_quarter": "1",
        "capacity": "4",
        "worker_capacity": "4",
        "worker_wage": "3",
        "worker_recruit_training_fee": "1",
        "installation_quarters": 1,
        "first_depreciation_maintenance_age": 1,
        "sources": [
          "第一季度!B11:F11",
          "第一季度!B18:E18"
        ],
        "timing_source": "当前实现口径：高/中端安装1期；低端当期投产；所有线购入当期免折旧维修；平台验证范围见测试说明"
      },
      {
        "id": "H2",
        "product": "high",
        "price": "6",
        "depreciation_rate": "0.1",
        "maintenance_per_quarter": "1",
        "capacity": "2",
        "worker_capacity": "2",
        "worker_wage": "3",
        "worker_recruit_training_fee": "1",
        "installation_quarters": 1,
        "first_depreciation_maintenance_age": 1,
        "sources": [
          "第一季度!B12:F12",
          "第一季度!B19:E19"
        ],
        "timing_source": "当前实现口径：高/中端安装1期；低端当期投产；所有线购入当期免折旧维修；平台验证范围见测试说明"
      },
      {
        "id": "M1",
        "product": "mid",
        "price": "9",
        "depreciation_rate": "0.1",
        "maintenance_per_quarter": "1",
        "capacity": "4",
        "worker_capacity": "4",
        "worker_wage": "2",
        "worker_recruit_training_fee": "1",
        "installation_quarters": 1,
        "first_depreciation_maintenance_age": 1,
        "sources": [
          "第一季度!B13:F13",
          "第一季度!B20:E20"
        ],
        "timing_source": "当前实现口径：高/中端安装1期；低端当期投产；所有线购入当期免折旧维修；平台验证范围见测试说明"
      },
      {
        "id": "M2",
        "product": "mid",
        "price": "5",
        "depreciation_rate": "0.1",
        "maintenance_per_quarter": "1",
        "capacity": "2",
        "worker_capacity": "2",
        "worker_wage": "2",
        "worker_recruit_training_fee": "1",
        "installation_quarters": 1,
        "first_depreciation_maintenance_age": 1,
        "sources": [
          "第一季度!B14:F14",
          "第一季度!B21:E21"
        ],
        "timing_source": "当前实现口径：高/中端安装1期；低端当期投产；所有线购入当期免折旧维修；平台验证范围见测试说明"
      },
      {
        "id": "L1",
        "product": "low",
        "price": "5",
        "depreciation_rate": "0.1",
        "maintenance_per_quarter": "1",
        "capacity": "4",
        "worker_capacity": "4",
        "worker_wage": "1",
        "worker_recruit_training_fee": "1",
        "installation_quarters": 0,
        "first_depreciation_maintenance_age": 1,
        "sources": [
          "第一季度!B15:F15",
          "第一季度!B22:E22"
        ],
        "timing_source": "当前实现口径：高/中端安装1期；低端当期投产；所有线购入当期免折旧维修；平台验证范围见测试说明"
      },
      {
        "id": "L2",
        "product": "low",
        "price": "2",
        "depreciation_rate": "0.1",
        "maintenance_per_quarter": "1",
        "capacity": "2",
        "worker_capacity": "2",
        "worker_wage": "1",
        "worker_recruit_training_fee": "1",
        "installation_quarters": 0,
        "first_depreciation_maintenance_age": 1,
        "sources": [
          "第一季度!B16:F16",
          "第一季度!B23:E23"
        ],
        "timing_source": "当前实现口径：高/中端安装1期；低端当期投产；所有线购入当期免折旧维修；平台验证范围见测试说明"
      }
    ],
    "products": [
      {
        "id": "high",
        "price_ceiling": "13",
        "material_unit_price": "3",
        "processing_per_unit": "1",
        "material_credit_quarters": 2,
        "ad_weight": "0.5",
        "price_weight": "0.5",
        "source": [
          "第一季度!C28:E28",
          "第一季度!N20:O20"
        ]
      },
      {
        "id": "mid",
        "price_ceiling": "10",
        "material_unit_price": "2",
        "processing_per_unit": "1",
        "material_credit_quarters": 1,
        "ad_weight": "0.4",
        "price_weight": "0.6",
        "source": [
          "第一季度!C29:E29",
          "第一季度!N21:O21"
        ]
      },
      {
        "id": "low",
        "price_ceiling": "6",
        "material_unit_price": "1",
        "processing_per_unit": "1",
        "material_credit_quarters": 0,
        "ad_weight": "0.3",
        "price_weight": "0.7",
        "source": [
          "第一季度!C30:E30",
          "第一季度!N22:O22"
        ]
      }
    ],
    "sales_staff": [
      {
        "id": "A",
        "wage": "1",
        "recruit_fee": "1"
      },
      {
        "id": "B",
        "wage": "2",
        "recruit_fee": "1"
      }
    ],
    "sales_training_productivity_rule": null,
    "rounding": {
      "internal": "decimal_full_precision",
      "platform_midpoint_policy": "unconfirmed",
      "observed": "0.125显示0.12；不足以断定截断或五成双",
      "presentation": "普通汇总暂用两位ROUND_HALF_UP；不能据此断言平台所有中点显示方式"
    },
    "strategic_constraints": {
      "no_dismissal": true,
      "no_line_disposal": true,
      "no_financial_investments": true,
      "material_purchase_equals_production": true,
      "prefer_equal_output_same_product": true,
      "zero_output_active_line": "不在已验证路径内，显式提示，不能静默计算为0成本"
    }
  },
  "presets": {
    "blank": {
      "name": "积玉B · 新的一局",
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
              "id": "JYB-Q1-R41",
              "product": "high",
              "demand": null,
              "lag": 2,
              "price": "13",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JYB-Q1-R42",
              "product": "mid",
              "demand": null,
              "lag": 2,
              "price": "10",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JYB-Q1-R43",
              "product": "low",
              "demand": null,
              "lag": 1,
              "price": "6",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JYB-Q1-R44",
              "product": "low",
              "demand": null,
              "lag": 0,
              "price": "6",
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
              "id": "JYB-Q2-R48",
              "product": "high",
              "demand": null,
              "lag": 2,
              "price": "13",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JYB-Q2-R49",
              "product": "mid",
              "demand": null,
              "lag": 1,
              "price": "10",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JYB-Q2-R50",
              "product": "low",
              "demand": null,
              "lag": 1,
              "price": "6",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JYB-Q2-R51",
              "product": "low",
              "demand": null,
              "lag": 0,
              "price": "6",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JYB-Q2-R52",
              "product": "low",
              "demand": null,
              "lag": 0,
              "price": "6",
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
              "id": "JYB-Q3-R56",
              "product": "high",
              "demand": null,
              "lag": 2,
              "price": "13",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JYB-Q3-R57",
              "product": "high",
              "demand": null,
              "lag": 1,
              "price": "13",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JYB-Q3-R58",
              "product": "mid",
              "demand": null,
              "lag": 2,
              "price": "10",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JYB-Q3-R59",
              "product": "mid",
              "demand": null,
              "lag": 1,
              "price": "10",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JYB-Q3-R60",
              "product": "low",
              "demand": null,
              "lag": 2,
              "price": "6",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JYB-Q3-R61",
              "product": "low",
              "demand": null,
              "lag": 1,
              "price": "6",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JYB-Q3-R62",
              "product": "low",
              "demand": null,
              "lag": 0,
              "price": "6",
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
              "id": "JYB-Q4-R66",
              "product": "high",
              "demand": null,
              "lag": 2,
              "price": "13",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JYB-Q4-R67",
              "product": "high",
              "demand": null,
              "lag": 1,
              "price": "13",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JYB-Q4-R68",
              "product": "mid",
              "demand": null,
              "lag": 2,
              "price": "10",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JYB-Q4-R69",
              "product": "mid",
              "demand": null,
              "lag": 1,
              "price": "10",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JYB-Q4-R70",
              "product": "low",
              "demand": null,
              "lag": 2,
              "price": "6",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JYB-Q4-R71",
              "product": "low",
              "demand": null,
              "lag": 1,
              "price": "6",
              "ad": 0,
              "quantity": 0,
              "cap": null,
              "splits": ""
            },
            {
              "id": "JYB-Q4-R72",
              "product": "low",
              "demand": null,
              "lag": 0,
              "price": "6",
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
};if(typeof module!=="undefined")module.exports=data;else g.JiyuData=data;})(globalThis);
